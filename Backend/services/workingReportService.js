const {
  createBulkNotifications,
  createNotification,
  getAdminRecipients
} = require('./notificationService');
const { validateSortParams, buildOrderBy } = require('../utils/sorting');

const REMINDER_DAYS = [7, 3, 1, 0];
const MS_PER_DAY = 86400000;

function validateMonthYear(month, year) {
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    return { error: 'Bulan tidak valid' };
  }
  if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    return { error: 'Tahun tidak valid' };
  }
  return { month: parsedMonth, year: parsedYear };
}

function jakartaDateOnly(date = new Date()) {
  const text = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
  return new Date(`${text}T00:00:00.000Z`);
}

function toUtcDateOnly(date = new Date()) {
  const parsedDate = new Date(date);
  return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));
}

function addDays(date, days) {
  return new Date(date.getTime() + (days * MS_PER_DAY));
}

function formatDateDMY(date) {
  return [
    String(date.getUTCDate()).padStart(2, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    date.getUTCFullYear()
  ].join('/');
}

function getReminderType(today, deadlineDate) {
  const daysBefore = Math.ceil((toUtcDateOnly(deadlineDate).getTime() - jakartaDateOnly(today).getTime()) / MS_PER_DAY);
  return REMINDER_DAYS.includes(daysBefore) ? `H-${daysBefore}` : null;
}

/*****/
/** Nama Function: getWorkingReportDeadline **/
/** Deskripsi Function: Menghitung deadline working report pada tanggal 15 bulan berikutnya **/
/** Creator by: FID.Iyan **/
/*****/
function getWorkingReportDeadline(month, year) {
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const deadlineMonth = parsedMonth === 12 ? 1 : parsedMonth + 1;
  const deadlineYear = parsedMonth === 12 ? parsedYear + 1 : parsedYear;
  return new Date(Date.UTC(deadlineYear, deadlineMonth - 1, 15));
}

/*****/
/** Nama Function: getWorkingReportReminderDates **/
/** Deskripsi Function: Menghitung tanggal reminder working report berdasarkan deadline **/
/** Creator by: FID.Iyan **/
/*****/
function getWorkingReportReminderDates(month, year) {
  const deadline = getWorkingReportDeadline(month, year);
  return {
    'H-7': addDays(deadline, -7),
    'H-3': addDays(deadline, -3),
    'H-1': addDays(deadline, -1),
    'H-0': deadline
  };
}

/*****/
/** Nama Function: getPreviousWorkingReportPeriod **/
/** Deskripsi Function: Menentukan periode working report sebelumnya dari tanggal berjalan **/
/** Creator by: FID.Iyan **/
/*****/
function getPreviousWorkingReportPeriod(currentDate = new Date()) {
  const today = jakartaDateOnly(currentDate);
  const currentMonth = today.getUTCMonth() + 1;
  const currentYear = today.getUTCFullYear();
  if (currentMonth === 1) return { month: 12, year: currentYear - 1 };
  return { month: currentMonth - 1, year: currentYear };
}

/*****/
/** Nama Function: calculateLateDays **/
/** Deskripsi Function: Menghitung jumlah hari keterlambatan setelah deadline working report **/
/** Creator by: FID.Iyan **/
/*****/
function calculateLateDays(deadlineDate, submittedAt = new Date()) {
  const submittedDate = jakartaDateOnly(submittedAt);
  const deadline = toUtcDateOnly(deadlineDate);
  if (submittedDate <= deadline) return 0;
  return Math.ceil((submittedDate.getTime() - deadline.getTime()) / MS_PER_DAY);
}

/*****/
/** Nama Function: shouldGenerateReminder **/
/** Deskripsi Function: Memvalidasi apakah hari ini termasuk jadwal reminder working report **/
/** Creator by: FID.Iyan **/
/*****/
function shouldGenerateReminder(today, deadlineDate) {
  return Boolean(getReminderType(today, deadlineDate));
}

function getWorkingReportStatusState(report, currentDate = new Date()) {
  const deadlineDate = getWorkingReportDeadline(report.month, report.year);
  const currentLateDays = calculateLateDays(deadlineDate, currentDate);
  const submittedOrApproved = ['SUBMITTED', 'APPROVED'].includes(report.status);
  const shouldBeLate = currentLateDays > 0 && !submittedOrApproved;

  if (submittedOrApproved) {
    return {
      deadlineDate,
      computedStatus: report.status,
      isLate: Boolean(report.isLate),
      lateDays: Number(report.lateDays) || 0
    };
  }

  if (shouldBeLate) {
    return {
      deadlineDate,
      computedStatus: 'LATE',
      isLate: true,
      lateDays: currentLateDays
    };
  }

  return {
    deadlineDate,
    computedStatus: report.status === 'LATE' ? 'DRAFT' : report.status,
    isLate: false,
    lateDays: 0
  };
}

function buildWorkingReportResponse(report, currentDate = new Date()) {
  const state = getWorkingReportStatusState(report, currentDate);
  return {
    ...report,
    deadlineDate: state.deadlineDate,
    isLate: state.isLate,
    lateDays: state.lateDays,
    computedStatus: state.computedStatus
  };
}

async function correctWorkingReportLateStatus(prisma, report, currentDate = new Date()) {
  if (!report || report.status !== 'LATE') return report;

  const state = getWorkingReportStatusState(report, currentDate);
  if (state.computedStatus === 'LATE') return report;

  return prisma.workingReport.update({
    where: { id: report.id },
    data: { status: 'DRAFT', isLate: false, lateDays: 0 },
    include: {
      user: { select: { id: true, name: true, email: true, jobRoleCode: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      rejectedBy: { select: { id: true, name: true, email: true } }
    }
  });
}

function getMonthRange(month, year) {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1))
  };
}

async function getManagedMemberIds(prisma, managerId) {
  const rows = await prisma.projectMember.findMany({
    where: { project: { projectManagerId: managerId } },
    select: { userId: true }
  });
  return [...new Set(rows.map(row => row.userId))];
}

/*****/
/** Nama Function: canAccessWorkingReportUser **/
/** Deskripsi Function: Memvalidasi akses user terhadap working report **/
/** Creator by: FID.Iyan **/
/*****/
async function canAccessWorkingReportUser(prisma, currentUser, targetUserId) {
  if (currentUser.role === 'ADMIN' || currentUser.id === targetUserId) return true;
  const managedCount = await prisma.projectMember.count({
    where: {
      userId: targetUserId,
      project: { projectManagerId: currentUser.id }
    }
  });
  return managedCount > 0;
}

/*****/
/** Nama Function: getWorkingReportDetail **/
/** Deskripsi Function: Mengambil working report dan attendance bulanan user **/
/** Creator by: FID.Iyan **/
/*****/
async function getWorkingReportDetail(prisma, userId, month, year, sortBy = 'date', sortOrder = 'asc') {
  const period = validateMonthYear(month, year);
  if (period.error) return { error: period.error };

  const validSort = validateSortParams(sortBy, sortOrder, ['date', 'checkInTime', 'checkOutTime']);
  const orderBy = buildOrderBy(validSort.sortBy, validSort.sortOrder, ['date', 'checkInTime', 'checkOutTime']);

  const [storedReport, attendances] = await Promise.all([
    prisma.workingReport.findUnique({
      where: { userId_month_year: { userId, month: period.month, year: period.year } },
      include: {
        approvedBy: { select: { id: true, name: true, email: true } },
        rejectedBy: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.attendance.findMany({
      where: { userId, date: getMonthRange(period.month, period.year) },
      orderBy
    })
  ]);

  const report = storedReport ? await correctWorkingReportLateStatus(prisma, storedReport) : null;
  const state = getWorkingReportStatusState(report || {
    month: period.month,
    year: period.year,
    status: 'DRAFT',
    isLate: false,
    lateDays: 0
  });

  return {
    report: report ? buildWorkingReportResponse(report) : null,
    attendances,
    deadlineDate: state.deadlineDate,
    isLate: state.isLate,
    lateDays: state.lateDays,
    computedStatus: state.computedStatus
  };
}

/*****/
/** Nama Function: getUserWorkingReports **/
/** Deskripsi Function: Mengambil daftar working report member dengan status hasil perhitungan deadline **/
/** Creator by: FID.Iyan **/
/*****/
async function getUserWorkingReports(prisma, userId) {
  const reports = await prisma.workingReport.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });
  const normalizedReports = [];

  for (const report of reports) {
    const correctedReport = await correctWorkingReportLateStatus(prisma, report);
    normalizedReports.push(buildWorkingReportResponse(correctedReport));
  }

  return normalizedReports;
}

/*****/
/** Nama Function: submitWorkingReport **/
/** Deskripsi Function: Submit working report member untuk periode bulanan **/
/** Creator by: FID.Iyan **/
/*****/
async function submitWorkingReport(prisma, userId, month, year) {
  const period = validateMonthYear(month, year);
  if (period.error) return { error: period.error };

  const existing = await prisma.workingReport.findUnique({
    where: { userId_month_year: { userId, month: period.month, year: period.year } }
  });
  if (existing?.status === 'APPROVED') return { error: 'Working Report yang sudah approved tidak dapat disubmit ulang' };

  const submittedAt = new Date();
  const deadlineDate = getWorkingReportDeadline(period.month, period.year);
  const lateDays = calculateLateDays(deadlineDate, submittedAt);
  const report = await prisma.workingReport.upsert({
    where: { userId_month_year: { userId, month: period.month, year: period.year } },
    create: {
      userId,
      month: period.month,
      year: period.year,
      status: 'SUBMITTED',
      submittedAt,
      isLate: lateDays > 0,
      lateDays
    },
    update: {
      status: 'SUBMITTED',
      submittedAt,
      approvedAt: null,
      approvedById: null,
      rejectedAt: null,
      rejectedById: null,
      rejectionReason: null,
      isLate: lateDays > 0,
      lateDays
    }
  });

  return { report, deadlineDate };
}

/*****/
/** Nama Function: listWorkingReports **/
/** Deskripsi Function: Mengambil daftar working report sesuai role dan filter **/
/** Creator by: FID.Iyan **/
/*****/
async function listWorkingReports(prisma, currentUser, filters = {}) {
  const andWhere = [];
  if (filters.month) andWhere.push({ month: Number(filters.month) });
  if (filters.year) andWhere.push({ year: Number(filters.year) });
  if (filters.status) andWhere.push({ status: filters.status });
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
  if (currentUser.role !== 'ADMIN') {
    andWhere.push({ user: { projects: { some: { project: { projectManagerId: currentUser.id } } } } });
  }

  const pageNo = Math.max(Number(filters.pageNo) || 1, 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize) || 10, 1), 50);

  const allowedSortFields = ['user.name', 'month', 'year', 'deadlineDate', 'status', 'lateDays', 'submittedAt', 'approvedAt'];
  let orderBy = buildOrderBy(filters.sortBy, filters.sortOrder, allowedSortFields, { sortBy: 'year', sortOrder: 'desc' });
  if (filters.sortBy === undefined || filters.sortBy === null) {
      orderBy = [{ year: 'desc' }, { month: 'desc' }, { updatedAt: 'desc' }];
  }
  const where = andWhere.length ? { AND: andWhere } : {};
  const [totalRows, data] = await Promise.all([
    prisma.workingReport.count({ where }),
    prisma.workingReport.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, jobRoleCode: true } },
        approvedBy: { select: { id: true, name: true } },
        rejectedBy: { select: { id: true, name: true } }
      },
      orderBy,
      skip: (pageNo - 1) * pageSize,
      take: pageSize
    })
  ]);

  const normalizedData = [];
  for (const report of data) {
    const correctedReport = await correctWorkingReportLateStatus(prisma, report);
    normalizedData.push(buildWorkingReportResponse(correctedReport));
  }

  return {
    data: normalizedData,
    page: { pageNo, pageSize, totalRows, totalPages: Math.ceil(totalRows / pageSize) }
  };
}

/*****/
/** Nama Function: approveWorkingReport **/
/** Deskripsi Function: Menyetujui working report oleh admin **/
/** Creator by: FID.Iyan **/
/*****/
async function approveWorkingReport(prisma, reportId, approverId) {
  const report = await prisma.workingReport.findUnique({ where: { id: reportId } });
  if (!report) return { error: 'Working Report tidak ditemukan' };
  if (!['SUBMITTED', 'REJECTED'].includes(report.status)) {
    return { error: 'Working Report belum dalam status yang bisa diapprove' };
  }

  return {
    report: await prisma.workingReport.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: approverId,
        rejectedAt: null,
        rejectedById: null,
        rejectionReason: null
      }
    })
  };
}

/*****/
/** Nama Function: rejectWorkingReport **/
/** Deskripsi Function: Menolak working report oleh admin dengan alasan **/
/** Creator by: FID.Iyan **/
/*****/
async function rejectWorkingReport(prisma, reportId, rejectedById, rejectionReason) {
  if (!String(rejectionReason || '').trim()) return { error: 'Alasan reject wajib diisi' };
  const report = await prisma.workingReport.findUnique({ where: { id: reportId } });
  if (!report) return { error: 'Working Report tidak ditemukan' };
  if (!['SUBMITTED', 'APPROVED'].includes(report.status)) {
    return { error: 'Working Report belum dalam status yang bisa direject' };
  }

  return {
    report: await prisma.workingReport.update({
      where: { id: reportId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedById,
        rejectionReason: String(rejectionReason).trim(),
        approvedAt: null,
        approvedById: null
      }
    })
  };
}

/*****/
/** Nama Function: generateWorkingReportReminders **/
/** Deskripsi Function: Membuat reminder working report mendekati deadline **/
/** Creator by: FID.Iyan **/
/*****/
async function generateWorkingReportReminders(prisma, options = {}) {
  const today = jakartaDateOnly(options.currentDate || new Date());
  const { month, year } = getPreviousWorkingReportPeriod(today);
  const deadline = getWorkingReportDeadline(month, year);
  const reminderType = getReminderType(today, deadline);
  const deadlineText = formatDateDMY(deadline);

  if (!shouldGenerateReminder(today, deadline)) {
    return { created: 0, skipped: true, message: 'Tanggal hari ini bukan jadwal reminder WR' };
  }

  const members = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    select: { id: true, name: true, email: true }
  });
  let created = 0;

  for (const member of members) {
    const report = await prisma.workingReport.findUnique({
      where: { userId_month_year: { userId: member.id, month, year } }
    });
    if (report && ['SUBMITTED', 'APPROVED'].includes(report.status)) continue;

    await createNotification(prisma, {
      userId: member.id,
      recipient: member,
      type: 'WR_REMINDER',
      title: 'Reminder Pengiriman Working Report',
      message: `Working Report periode ${month}/${year} perlu dikirim sebelum tanggal ${deadlineText}.`,
      detail: `Deadline: ${deadlineText}`,
      referenceId: `WR_REMINDER-${member.id}-${month}-${year}-${reminderType}`,
      referenceType: 'WORKING_REPORT',
      skipDuplicate: true
    });
    created += 1;
  }

  return { created, month, year, deadlineDate: deadline, reminderType };
}

/*****/
/** Nama Function: generateWorkingReportLateStatus **/
/** Deskripsi Function: Menandai working report terlambat dan membuat notifikasi **/
/** Creator by: FID.Iyan **/
/*****/
async function generateWorkingReportLateStatus(prisma, options = {}) {
  const today = jakartaDateOnly(options.currentDate || new Date());
  const { month, year } = getPreviousWorkingReportPeriod(today);
  const deadline = getWorkingReportDeadline(month, year);
  const deadlineText = formatDateDMY(deadline);
  const lateDays = calculateLateDays(deadline, today);

  if (lateDays <= 0) {
    return { created: 0, skipped: true, message: 'Belum melewati deadline WR' };
  }

  const [members, admins] = await Promise.all([
    prisma.user.findMany({ where: { role: 'MEMBER' }, select: { id: true, name: true, email: true } }),
    getAdminRecipients(prisma)
  ]);
  let created = 0;

  for (const member of members) {
    const report = await prisma.workingReport.findUnique({
      where: { userId_month_year: { userId: member.id, month, year } }
    });
    if (report && ['SUBMITTED', 'APPROVED'].includes(report.status)) continue;

    const lateReport = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.workingReport.upsert({
        where: { userId_month_year: { userId: member.id, month, year } },
        create: { userId: member.id, month, year, status: 'LATE', isLate: true, lateDays },
        update: { status: 'LATE', isLate: true, lateDays }
      });

      await createNotification(tx, {
        userId: member.id,
        recipient: member,
        type: 'WR_LATE',
        title: 'Working Report Terlambat',
        message: `Working Report periode ${month}/${year} melewati deadline submit ${deadlineText}.`,
        detail: `Keterlambatan: ${lateDays} hari.`,
        referenceId: `WR_LATE-${member.id}-${month}-${year}`,
        referenceType: 'WORKING_REPORT',
        skipDuplicate: true
      });
      await createBulkNotifications(tx, admins, {
        type: 'WR_LATE',
        title: 'Working Report Terlambat',
        message: `Working Report periode ${month}/${year} milik ${member.name} melewati deadline submit ${deadlineText}.`,
        detail: `Keterlambatan: ${lateDays} hari.`,
        referenceId: `WR_LATE-${member.id}-${month}-${year}`,
        referenceType: 'WORKING_REPORT',
        skipDuplicate: true
      });

      return updatedReport;
    });
    if (lateReport) created += 1;
  }

  return { created, month, year, deadlineDate: deadline, lateDays };
}

module.exports = {
  canAccessWorkingReportUser,
  getWorkingReportDeadline,
  getWorkingReportReminderDates,
  getPreviousWorkingReportPeriod,
  calculateLateDays,
  shouldGenerateReminder,
  getWorkingReportStatusState,
  getWorkingReportDetail,
  getUserWorkingReports,
  submitWorkingReport,
  listWorkingReports,
  approveWorkingReport,
  rejectWorkingReport,
  generateWorkingReportReminders,
  generateWorkingReportLateStatus,
  validateMonthYear
};
