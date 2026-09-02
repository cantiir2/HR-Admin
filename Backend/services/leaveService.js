const {
  createBulkNotifications,
  createNotification,
  getAdminRecipients,
  getUserRecipient,
  sendNotificationEmails
} = require('./notificationService');
const { buildOrderBy } = require('../utils/sorting');
const { getDataUrlMimeType, validateBase64File } = require('../utils/fileValidation');

const LEAVE_TYPES = ['ANNUAL_LEAVE', 'OTHERS'];
const EVIDENCE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EVIDENCE_MAX_FILE_SIZE = 5 * 1024 * 1024;

function parseDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnly(date) {
  const value = new Date(date);
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function uniqueRecipients(recipients = []) {
  return [...new Map(recipients.filter(Boolean).map(user => [user.id, user])).values()];
}

function normalizeLeaveType(value) {
  return LEAVE_TYPES.includes(value) ? value : 'ANNUAL_LEAVE';
}

function evidenceAvailabilityText(hasEvidencePhoto) {
  return hasEvidencePhoto ? 'Evidence tersedia' : 'Tidak ada evidence';
}

function buildEvidencePhotoName(userId, fileName, mimeType) {
  if (String(fileName || '').trim()) return String(fileName).trim();
  const extensionByMime = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  const extension = extensionByMime[mimeType] || 'bin';
  return `${userId}_leave_evidence_${Date.now()}.${extension}`;
}

function buildEvidenceData(userId, data = {}) {
  const leaveType = normalizeLeaveType(data.leaveType);
  if (leaveType !== 'OTHERS' || !data.evidencePhoto) {
    return {
      leaveType,
      evidencePhoto: null,
      evidencePhotoName: null,
      evidencePhotoMimeType: null
    };
  }

  const evidencePhotoMimeType = data.evidencePhotoMimeType || getDataUrlMimeType(data.evidencePhoto);
  const evidencePhotoName = buildEvidencePhotoName(userId, data.evidencePhotoName, evidencePhotoMimeType);
  const validationError = validateBase64File({
    fileData: data.evidencePhoto,
    fileName: evidencePhotoName,
    mimeType: evidencePhotoMimeType,
    allowedMimeTypes: EVIDENCE_ALLOWED_MIME_TYPES,
    maxSizeBytes: EVIDENCE_MAX_FILE_SIZE,
    maxSizeLabel: '5MB'
  });
  if (validationError) return { error: validationError };

  return {
    leaveType,
    evidencePhoto: data.evidencePhoto,
    evidencePhotoName,
    evidencePhotoMimeType
  };
}

function toLeaveResponse(leave, currentUser) {
  if (!leave) return leave;
  const { evidencePhoto, user, ...safeLeave } = leave;
  let isCurrentUserPm = false;
  let safeUser = user;
  if (user) {
    const { projects, ...restUser } = user;
    safeUser = restUser;
    if (currentUser && Array.isArray(projects)) {
      isCurrentUserPm = projects.some(p => p.project?.projectManagerId === currentUser.id);
    }
  }
  return {
    ...safeLeave,
    user: safeUser,
    hasEvidencePhoto: Boolean(evidencePhoto),
    isCurrentUserPm
  };
}

function calculateContractMonths(startDate, endDate) {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  const monthDiff = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  return Math.max(1, monthDiff + (end.getUTCDate() >= start.getUTCDate() ? 1 : 0));
}

async function findEligibleContract(prisma, userId, startDate, endDate) {
  const activeContract = await prisma.userContract.findFirst({
    where: {
      userId,
      startDate: { lte: startDate },
      endDate: { gte: endDate }
    },
    orderBy: { endDate: 'desc' }
  });
  if (activeContract) return activeContract;

  return prisma.userContract.findFirst({
    where: { userId },
    orderBy: { endDate: 'desc' }
  });
}

async function getProjectManagerRecipientsForUser(prisma, userId) {
  const rows = await prisma.projectMember.findMany({
    where: { userId, project: { projectManagerId: { not: null } } },
    select: {
      project: {
        select: {
          projectManager: { select: { id: true, name: true, email: true, role: true } }
        }
      }
    }
  });
  return uniqueRecipients(rows.map(row => row.project.projectManager));
}

// Name Function : getDeductedLeaveDays
// Author : Iyan.FID
// Description : Menghitung jumlah hari yang memotong cuti berdasarkan tipe cuti dan evidence
function getDeductedLeaveDays(leave) {
  if (!leave) return 0;

  const totalDays = Number(leave.totalDays) || 0;

  if (leave.leaveType === 'ANNUAL_LEAVE') {
    return totalDays;
  }

  if (leave.leaveType === 'OTHERS') {
    const hasEvidence = Boolean(leave.evidencePhoto) || Boolean(leave.hasEvidencePhoto);

    if (hasEvidence) {
      return 0;
    }

    if (totalDays <= 1) {
      return 0;
    }

    return totalDays - 1;
  }

  return totalDays;
}

/*****/
/** Nama Function: calculateWorkingDays **/
/** Deskripsi Function: Menghitung jumlah hari kerja Senin sampai Jumat **/
/** Creator by: FID.Iyan **/
/*****/
function calculateWorkingDays(startDate, endDate) {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);
  if (start > end) return 0;

  let total = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) total += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return total;
}

/*****/
/** Nama Function: getLeaveBalance **/
/** Deskripsi Function: Menghitung jatah, pemakaian, dan sisa cuti user **/
/** Creator by: FID.Iyan **/
/*****/
async function getLeaveBalance(prisma, userId, contractId) {
  const contract = contractId
    ? await prisma.userContract.findFirst({ where: { id: contractId, userId } })
    : await prisma.userContract.findFirst({ where: { userId }, orderBy: { endDate: 'desc' } });

  if (!contract) {
    return { contract: null, entitlementDays: 0, usedLeaveDays: 0, remainingLeaveDays: 0 };
  }

  const entitlementDays = (contract.annualLeaveQuota !== null && contract.annualLeaveQuota !== undefined)
    ? Number(contract.annualLeaveQuota)
    : calculateContractMonths(contract.startDate, contract.endDate);
  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: { userId, contractId: contract.id, status: 'APPROVED' },
    select: {
      totalDays: true,
      leaveType: true,
      evidencePhoto: true,
      startDate: true,
      endDate: true
    }
  });
  const usedLeaveDays = approvedLeaves.reduce((total, leave) => {
    return total + getDeductedLeaveDays(leave);
  }, 0);

  return {
    contract,
    entitlementDays,
    usedLeaveDays,
    remainingLeaveDays: entitlementDays - usedLeaveDays
  };
}

/*****/
/** Nama Function: isProjectManagerForUser **/
/** Deskripsi Function: Memvalidasi project manager terhadap member project **/
/** Creator by: FID.Iyan **/
/*****/
async function isProjectManagerForUser(prisma, managerId, userId) {
  const count = await prisma.projectMember.count({
    where: { userId, project: { projectManagerId: managerId } }
  });
  return count > 0;
}

/*****/
/** Nama Function: createLeaveRequest **/
/** Deskripsi Function: Membuat pengajuan cuti dan notifikasi approval **/
/** Creator by: FID.Iyan **/
/*****/
async function createLeaveRequest(prisma, userId, data = {}, currentUser) {
  const startDate = parseDateOnly(data.startDate);
  const endDate = parseDateOnly(data.endDate);
  const reason = String(data.reason || '').trim();
  const evidenceData = buildEvidenceData(userId, data);

  if (!startDate || !endDate) return { error: 'Tanggal cuti wajib valid dengan format YYYY-MM-DD' };
  if (startDate > endDate) return { error: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' };
  if (!reason) return { error: 'Alasan cuti wajib diisi' };
  if (evidenceData.error) return { error: evidenceData.error };

  const totalDays = calculateWorkingDays(startDate, endDate);
  if (totalDays <= 0) return { error: 'Tanggal cuti harus memiliki minimal satu hari kerja' };

  const overlappingLeave = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: { in: ['PENDING', 'APPROVED_BY_PM', 'APPROVED'] },
      startDate: { lte: endDate },
      endDate: { gte: startDate }
    }
  });
  if (overlappingLeave) {
    return { error: 'Tanggal pengajuan cuti bertabrakan (overlap) dengan pengajuan cuti Anda yang sudah ada.' };
  }

  const contract = await findEligibleContract(prisma, userId, startDate, endDate);
  if (!contract) return { error: 'Kontrak user tidak ditemukan' };

  const balance = await getLeaveBalance(prisma, userId, contract.id);
  const requestedDeductDays = getDeductedLeaveDays({
    leaveType: evidenceData.leaveType,
    evidencePhoto: evidenceData.evidencePhoto,
    totalDays
  });

  const overQuotaDays = Math.max(0, requestedDeductDays - balance.remainingLeaveDays);
  const isOverQuota = overQuotaDays > 0;

  if (isOverQuota && !data.warningAcknowledged) {
    return {
      requiresWarning: true,
      balance: {
        remainingLeaveDays: balance.remainingLeaveDays,
        totalDays,
        requestedDeductDays,
        overQuotaDays
      }
    };
  }

  const requester = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  });

  const transactionResult = await prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.create({
      data: {
        userId,
        contractId: contract.id,
        leaveType: evidenceData.leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        evidencePhoto: evidenceData.evidencePhoto,
        evidencePhotoName: evidenceData.evidencePhotoName,
        evidencePhotoMimeType: evidenceData.evidencePhotoMimeType,
        isOverQuota,
        overQuotaDays
      }
    });

    const uniquePms = await getProjectManagerRecipientsForUser(tx, userId);
    const detail = `User: ${requester?.name || 'Karyawan'} (${requester?.email || '-'})\n` +
      `Periode: ${startDate.toISOString().slice(0, 10)} - ${endDate.toISOString().slice(0, 10)}\n` +
      `Total Hari: ${totalDays} hari\n` +
      `Status Kuota: ${isOverQuota ? `Melebihi jatah ${overQuotaDays} hari` : 'Normal'}\n` +
      `Alasan: ${reason}`;

    const notifications = [];

    for (const pm of uniquePms) {
      const notif = await createNotification(tx, {
        userId: pm.id,
        recipient: pm,
        type: 'LEAVE_REQUEST',
        title: 'Pengajuan Cuti Baru',
        message: detail,
        // emailDetail: detail,
        referenceId: leave.id,
        referenceType: 'LEAVE_REQUEST',
        skipDuplicate: true,
        sendEmail: false
      });
      notifications.push(notif);
    }

    if (isOverQuota) {
      for (const pm of uniquePms) {
        const overQuotaNotif = await createNotification(tx, {
          userId: pm.id,
          recipient: pm,
          type: 'LEAVE_OVER_QUOTA',
          title: 'Peringatan Cuti Melebihi Jatah',
          message: `${requester?.name || 'Karyawan'} mengajukan cuti melebihi jatah sebanyak ${overQuotaDays} hari.`,
          detail: `Sisa cuti: ${balance.remainingLeaveDays} hari. Diajukan: ${totalDays} hari.`,
          referenceId: leave.id,
          referenceType: 'LEAVE_REQUEST',
          skipDuplicate: true,
          sendEmail: false
        });
        notifications.push(overQuotaNotif);
      }
    }

    return {
      leave: toLeaveResponse(leave, currentUser),
      notifications
    };
  }, {
    timeout: 15000
  });

  sendNotificationEmails(prisma, transactionResult.notifications).catch(() => { });

  return {
    leave: transactionResult.leave
  };
}

/*****/
/** Nama Function: listLeaveRequests **/
/** Deskripsi Function: Mengambil daftar cuti sesuai role dan filter **/
/** Creator by: FID.Iyan **/
/*****/
async function listLeaveRequests(prisma, currentUser, filters = {}) {
  const andWhere = [];
  if (filters.status) {
    const statuses = String(filters.status).split(',').map(s => s.trim()).filter(Boolean);
    if (statuses.length > 1) {
      andWhere.push({ status: { in: statuses } });
    } else if (statuses.length === 1) {
      andWhere.push({ status: statuses[0] });
    }
  }
  if (filters.search) {
    andWhere.push({
      user: {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    });
  }
  if (filters.projectManagerId) {
    andWhere.push({ user: { projects: { some: { project: { projectManagerId: filters.projectManagerId } } } } });
  }

  const pageNo = Math.max(Number(filters.pageNo) || 1, 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize) || 10, 1), 50);

  const allowedSortFields = ['user.name', 'leaveType', 'startDate', 'endDate', 'totalDays', 'status', 'isOverQuota', 'createdAt'];
  const orderBy = buildOrderBy(filters.sortBy, filters.sortOrder, allowedSortFields, { sortBy: 'createdAt', sortOrder: 'desc' });

  const where = andWhere.length ? { AND: andWhere } : {};
  const [totalRows, data] = await Promise.all([
    prisma.leaveRequest.count({ where }),
    prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            jobRoleCode: true,
            projects: { select: { project: { select: { projectManagerId: true } } } }
          }
        },
        contract: true,
        pmApprover: { select: { id: true, name: true } },
        adminApprover: { select: { id: true, name: true } },
        rejectedBy: { select: { id: true, name: true } }
      },
      orderBy,
      skip: (pageNo - 1) * pageSize,
      take: pageSize
    })
  ]);

  const userContractBalances = new Map();
  const dataWithBalances = await Promise.all(data.map(async (item) => {
    const key = `${item.userId}_${item.contractId}`;
    let balance = userContractBalances.get(key);
    if (!balance) {
      balance = await getLeaveBalance(prisma, item.userId, item.contractId);
      userContractBalances.set(key, balance);
    }
    const response = toLeaveResponse(item, currentUser);
    return {
      ...response,
      leaveBalance: {
        entitlementDays: balance.entitlementDays,
        usedLeaveDays: balance.usedLeaveDays,
        remainingLeaveDays: balance.remainingLeaveDays
      }
    };
  }));

  return {
    data: dataWithBalances,
    total: totalRows,
    page: { pageNo, pageSize, totalRows, totalPages: Math.ceil(totalRows / pageSize) }
  };
}

/*****/
/** Nama Function: getLeaveEvidencePhoto **/
/** Deskripsi Function: Mengambil evidence photo cuti sesuai hak akses user **/
/** Creator by: FID.Iyan **/
/*****/
async function getLeaveEvidencePhoto(prisma, leaveId, currentUser) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    select: {
      id: true,
      userId: true,
      evidencePhoto: true,
      evidencePhotoName: true,
      evidencePhotoMimeType: true
    }
  });
  if (!leave) return { status: 404, error: 'Pengajuan cuti tidak ditemukan' };
  if (!leave.evidencePhoto) return { status: 404, error: 'Evidence photo tidak ditemukan' };

  return {
    fileData: leave.evidencePhoto,
    fileName: leave.evidencePhotoName || 'leave-evidence',
    fileType: leave.evidencePhotoMimeType || 'application/octet-stream'
  };
}

/*****/
/** Nama Function: cancelLeaveRequest **/
/** Deskripsi Function: Membatalkan pengajuan cuti milik member **/
/** Creator by: FID.Iyan **/
/*****/
async function cancelLeaveRequest(prisma, leaveId, userId) {
  const leave = await prisma.leaveRequest.findFirst({ where: { id: leaveId, userId } });
  if (!leave) return { error: 'Pengajuan cuti tidak ditemukan' };
  if (!['PENDING', 'APPROVED_BY_PM'].includes(leave.status)) {
    return { error: 'Pengajuan cuti tidak dapat dibatalkan' };
  }
  return {
    leave: await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' }
    })
  };
}

/*****/
/** Nama Function: approveLeaveByPm **/
/** Deskripsi Function: Menyetujui cuti tahap project manager **/
/** Creator by: FID.Iyan **/
/*****/
async function approveLeaveByPm(prisma, leaveId, approver) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  if (!leave) return { error: 'Pengajuan cuti tidak ditemukan' };
  if (leave.status !== 'PENDING') return { error: 'Pengajuan cuti tidak dalam status pending' };

  const isAdmin = approver.role === 'ADMIN' ||
    approver.role === 'System Administrator' ||
    (Array.isArray(approver.roles) && (approver.roles.includes('ADMIN') || approver.roles.includes('System Administrator')));

  if (!isAdmin && !(await isProjectManagerForUser(prisma, approver.id, leave.userId))) {
    return { error: 'Anda tidak memiliki akses approval cuti ini' };
  }

  const transactionResult = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED', pmApproverId: approver.id, pmApprovedAt: new Date() }
    });

    const notifUser = await createNotification(tx, {
      userId: leave.userId,
      recipient: leave.user,
      type: 'LEAVE_APPROVAL',
      title: 'Pengajuan Cuti Disetujui',
      message: 'Pengajuan cuti Anda telah disetujui.',
      referenceId: leave.id,
      referenceType: 'LEAVE_REQUEST',
      sendEmail: false
    });

    const notifications = [notifUser];

    if (isAdmin) {
      const pms = await getProjectManagerRecipientsForUser(tx, leave.userId);
      if (pms.length > 0) {
        const notifsPms = await createBulkNotifications(tx, pms, {
          type: 'LEAVE_APPROVAL',
          title: 'Pengajuan Cuti Disetujui Admin',
          message: `Pengajuan cuti ${leave.user.name} telah disetujui Admin atas persetujuan PM.`,
          referenceId: leave.id,
          referenceType: 'LEAVE_REQUEST',
          skipDuplicate: true,
          sendEmail: false
        });
        notifications.push(...notifsPms);
      }
    } else {
      const admins = await getAdminRecipients(tx);
      if (admins.length > 0) {
        const notifsAdmins = await createBulkNotifications(tx, admins, {
          type: 'LEAVE_APPROVAL',
          title: 'Pengajuan Cuti Disetujui PM',
          message: `Pengajuan cuti ${leave.user.name} telah disetujui oleh Project Manager.`,
          referenceId: leave.id,
          referenceType: 'LEAVE_REQUEST',
          skipDuplicate: true,
          sendEmail: false
        });
        notifications.push(...notifsAdmins);
      }
    }

    return { leave: updated, notifications };
  });

  sendNotificationEmails(prisma, transactionResult.notifications).catch(() => { });
  return { leave: transactionResult.leave };
}

/*****
/** Nama Function: approveLeaveByAdmin **/
/** Deskripsi Function: Menyetujui cuti final oleh admin **/
/** Creator by: FID.Iyan **/
/*****/
async function approveLeaveByAdmin(prisma, leaveId, adminId) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  if (!leave) return { error: 'Pengajuan cuti tidak ditemukan' };
  if (!['PENDING', 'APPROVED_BY_PM'].includes(leave.status)) {
    return { error: 'Pengajuan cuti tidak dalam status yang bisa diapprove Admin' };
  }

  const transactionResult = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED', adminApproverId: adminId, adminApprovedAt: new Date() }
    });
    const pms = await getProjectManagerRecipientsForUser(tx, leave.userId);
    const notifs1 = await createNotification(tx, {
      userId: leave.userId,
      recipient: leave.user,
      type: 'LEAVE_APPROVAL',
      title: 'Pengajuan Cuti Disetujui',
      message: 'Pengajuan cuti Anda sudah disetujui Admin.',
      referenceId: leave.id,
      referenceType: 'LEAVE_REQUEST',
      sendEmail: false
    });
    const notifs2 = await createBulkNotifications(tx, pms, {
      type: 'LEAVE_APPROVAL',
      title: 'Pengajuan Cuti Disetujui Admin',
      message: `Pengajuan cuti ${leave.user.name} sudah disetujui Admin.`,
      referenceId: leave.id,
      referenceType: 'LEAVE_REQUEST',
      skipDuplicate: true,
      sendEmail: false
    });
    return { leave: updated, notifications: [notifs1, ...notifs2] };
  });

  sendNotificationEmails(prisma, transactionResult.notifications).catch(() => { });
  return { leave: transactionResult.leave };
}

/*****
/** Nama Function: rejectLeaveRequest **/
/** Deskripsi Function: Menolak pengajuan cuti oleh PM atau Admin **/
/** Creator by: FID.Iyan **/
/*****/
async function rejectLeaveRequest(prisma, leaveId, rejectedBy, rejectionReason) {
  if (!String(rejectionReason || '').trim()) return { error: 'Alasan reject wajib diisi' };
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
  if (!leave) return { error: 'Pengajuan cuti tidak ditemukan' };
  if (!['PENDING', 'APPROVED_BY_PM'].includes(leave.status)) return { error: 'Pengajuan cuti tidak dapat direject' };

  const isAdmin = rejectedBy.role === 'ADMIN' ||
    rejectedBy.role === 'System Administrator' ||
    (Array.isArray(rejectedBy.roles) && (rejectedBy.roles.includes('ADMIN') || rejectedBy.roles.includes('System Administrator')));

  if (!isAdmin && !(await isProjectManagerForUser(prisma, rejectedBy.id, leave.userId))) {
    return { error: 'Anda tidak memiliki akses reject cuti ini' };
  }

  const transactionResult = await prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: 'REJECTED',
        rejectedById: rejectedBy.id,
        rejectedAt: new Date(),
        rejectionReason: String(rejectionReason).trim()
      }
    });
    const notifs1 = await createNotification(tx, {
      userId: leave.userId,
      recipient: leave.user,
      type: 'LEAVE_REJECTED',
      title: 'Pengajuan Cuti Ditolak',
      message: `Pengajuan cuti Anda ditolak. Alasan: ${String(rejectionReason).trim()}`,
      referenceId: leave.id,
      referenceType: 'LEAVE_REQUEST',
      sendEmail: false
    });
    return { leave: updated, notifications: [notifs1] };
  });

  sendNotificationEmails(prisma, transactionResult.notifications).catch(() => { });
  return { leave: transactionResult.leave };
}

module.exports = {
  calculateWorkingDays,
  getLeaveBalance,
  isProjectManagerForUser,
  toLeaveResponse,
  createLeaveRequest,
  listLeaveRequests,
  getLeaveEvidencePhoto,
  cancelLeaveRequest,
  approveLeaveByPm,
  approveLeaveByAdmin,
  rejectLeaveRequest
};
