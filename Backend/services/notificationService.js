const { SUBJECT_BY_TYPE, sendEmailNotification } = require('./emailService');

function uniqueRecipients(recipients = []) {
  return [...new Map(recipients.filter(Boolean).map(user => [user.id, user])).values()];
}

function buildEmailPayload(notification, data, recipient) {
  return {
    to: recipient?.email,
    recipientName: recipient?.name,
    type: data.type,
    subject: data.subject || SUBJECT_BY_TYPE[data.type],
    message: data.emailMessage || data.message,
    detail: data.emailDetail || data.detail
  };
}

/*****/
/** Nama Function: getAdminRecipients **/
/** Deskripsi Function: Mengambil daftar email admin dari tb_m_user **/
/** Creator by: FID.Iyan **/
/*****/
async function getAdminRecipients(prisma) {
  return prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true }
  });
}

/*****/
/** Nama Function: getProjectManagerRecipient **/
/** Deskripsi Function: Mengambil email project manager dari relasi project **/
/** Creator by: FID.Iyan **/
/*****/
async function getProjectManagerRecipient(prisma, projectId) {
  if (!projectId) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      projectManager: { select: { id: true, name: true, email: true, role: true } }
    }
  });
  return project?.projectManager || null;
}

/*****/
/** Nama Function: getUserRecipient **/
/** Deskripsi Function: Mengambil email user dari tb_m_user **/
/** Creator by: FID.Iyan **/
/*****/
async function getUserRecipient(prisma, userId) {
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true }
  });
}

/*****/
/** Nama Function: markEmailAsSent **/
/** Deskripsi Function: Menandai notifikasi email sudah terkirim **/
/** Creator by: FID.Iyan **/
/*****/
async function markEmailAsSent(prisma, notificationId) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { emailSent: true, emailSentAt: new Date(), emailError: null }
  });
}

/*****/
/** Nama Function: markEmailAsFailed **/
/** Deskripsi Function: Menyimpan informasi kegagalan email notifikasi **/
/** Creator by: FID.Iyan **/
/*****/
async function markEmailAsFailed(prisma, notificationId, errorMessage) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { emailSent: false, emailError: String(errorMessage || 'Email notification failed').slice(0, 1000) }
  });
}

/*****/
/** Nama Function: sendNotificationEmail **/
/** Deskripsi Function: Mengirim email notifikasi **/
/** Creator by: FID.Iyan **/
/*****/
async function sendNotificationEmail(prisma, item) {
  if (!item || !item.notification || !item.emailPayload || item.skipped) return item;

  try {
    const result = await sendEmailNotification(item.emailPayload);
    if (result.sent) {
      item.notification = await markEmailAsSent(prisma, item.notification.id);
      return item;
    }
    if (result.reason || result.error) {
      item.notification = await markEmailAsFailed(prisma, item.notification.id, result.reason || result.error);
      return item;
    }
  } catch (error) {
    console.error('Notification email handling failed:', error.message);
    try {
      item.notification = await markEmailAsFailed(prisma, item.notification.id, error.message);
      return item;
    } catch {
      return item;
    }
  }
  return item;
}

/*****/
/** Nama Function: sendNotificationEmails **/
/** Deskripsi Function: Mengirim banyak email notifikasi **/
/** Creator by: FID.Iyan **/
/*****/
async function sendNotificationEmails(prisma, items) {
  if (!Array.isArray(items)) return [];
  const results = [];
  for (const item of items) {
    results.push(await sendNotificationEmail(prisma, item));
  }
  return results;
}

/*****/
/** Nama Function: createNotification **/
/** Deskripsi Function: Membuat notifikasi in-app dan mengirim email jika aktif **/
/** Creator by: FID.Iyan **/
/*****/
async function createNotification(prisma, data = {}) {
  if (!data.userId || !data.type || !data.title || !data.message) {
    throw new Error('Data notifikasi tidak lengkap');
  }

  if (data.skipDuplicate && data.referenceId) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: data.userId,
        type: data.type,
        referenceId: data.referenceId,
        referenceType: data.referenceType || null
      }
    });
    if (existing) return { notification: existing, emailPayload: null, skipped: true };
  }

  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      referenceId: data.referenceId || null,
      referenceType: data.referenceType || null,
      channel: data.channel || 'BOTH'
    }
  });

  const sendEmail = data.sendEmail !== false;
  const recipient = data.recipient || await getUserRecipient(prisma, data.userId);
  const emailPayload = notification.channel !== 'IN_APP' ? buildEmailPayload(notification, data, recipient) : null;
  const resultObj = { notification, emailPayload, skipped: false };

  if (notification.channel === 'IN_APP' || !sendEmail) return resultObj;

  return sendNotificationEmail(prisma, resultObj);
}

/*****/
/** Nama Function: createBulkNotifications **/
/** Deskripsi Function: Membuat banyak notifikasi dengan sumber data penerima dari database **/
/** Creator by: FID.Iyan **/
/*****/
async function createBulkNotifications(prisma, recipients = [], data = {}) {
  const users = uniqueRecipients(recipients);
  const created = [];

  for (const recipient of users) {
    created.push(await createNotification(prisma, {
      ...data,
      userId: recipient.id,
      recipient
    }));
  }

  return created;
}

/*****/
/** Nama Function: getPmAdminRecipients **/
/** Deskripsi Function: Mengambil daftar email admin dengan role PM **/
/** Creator by: FID.Iyan **/
/*****/
async function getPmAdminRecipients(prisma) {
  return prisma.user.findMany({
    where: {
      role: 'ADMIN',
      jobRoleCode: 'PM'
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      jobRoleCode: true
    }
  });
}

/*****/
/** Nama Function: getProjectManagerRecipientsForAttendanceRequest **/
/** Deskripsi Function: Mencari PM project yang relevan berdasarkan assignment member dan tanggal request attendance **/
/** Creator by: FID.Iyan **/
/*****/
async function getProjectManagerRecipientsForAttendanceRequest(prisma, userId, requestDate) {
  const d = new Date(requestDate);

  const assignments = await prisma.projectMember.findMany({
    where: {
      userId,
      project: { status: 'active' }
    },
    include: {
      project: {
        include: {
          projectManager: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              jobRoleCode: true
            }
          }
        }
      }
    }
  });

  const pmMap = new Map();

  for (const assignment of assignments) {
    const start = assignment.joinedAt || assignment.project.contractStart;
    const end = assignment.leftAt || assignment.project.contractEnd;

    if (start && start > d) continue;
    if (end && end < d) continue;

    const pm = assignment.project.projectManager;
    if (!pm) continue;
    if (pm.role !== 'ADMIN') continue;
    if (pm.jobRoleCode !== 'PM') continue;

    if (!pmMap.has(pm.id)) {
      pmMap.set(pm.id, {
        ...pm,
        projectNames: [assignment.project.name]
      });
    } else {
      const existing = pmMap.get(pm.id);
      if (!existing.projectNames.includes(assignment.project.name)) {
        existing.projectNames.push(assignment.project.name);
      }
    }
  }

  return Array.from(pmMap.values());
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getAdminRecipients,
  getProjectManagerRecipient,
  getUserRecipient,
  markEmailAsSent,
  markEmailAsFailed,
  buildEmailPayload,
  sendNotificationEmail,
  sendNotificationEmails,
  getPmAdminRecipients,
  getProjectManagerRecipientsForAttendanceRequest
};
