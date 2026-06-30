const { SUBJECT_BY_TYPE, sendEmailNotification } = require('./emailService');

function uniqueRecipients(recipients = []) {
  return [...new Map(recipients.filter(Boolean).map(user => [user.id, user])).values()];
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
    if (existing) return existing;
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

  if (notification.channel === 'IN_APP') return notification;

  try {
    const recipient = data.recipient || await getUserRecipient(prisma, data.userId);
    const result = await sendEmailNotification({
      to: recipient?.email,
      recipientName: recipient?.name,
      type: data.type,
      subject: data.subject || SUBJECT_BY_TYPE[data.type],
      message: data.emailMessage || data.message,
      detail: data.emailDetail || data.detail
    });

    if (result.sent) {
      return markEmailAsSent(prisma, notification.id);
    }

    if (result.reason || result.error) {
      return markEmailAsFailed(prisma, notification.id, result.reason || result.error);
    }
  } catch (error) {
    console.error('Notification email handling failed:', error.message);
    try {
      return await markEmailAsFailed(prisma, notification.id, error.message);
    } catch {
      return notification;
    }
  }

  return notification;
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

module.exports = {
  createNotification,
  createBulkNotifications,
  getAdminRecipients,
  getProjectManagerRecipient,
  getUserRecipient,
  markEmailAsSent,
  markEmailAsFailed
};
