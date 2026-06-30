const { createBulkNotifications } = require('./notificationService');

/*****/
/** Nama Function: generateContractExpiringNotifications **/
/** Deskripsi Function: Generate notifikasi kontrak yang akan expired berdasarkan reminder day **/
/** Creator by: FID.Iyan **/
/*****/
async function generateContractExpiringNotifications(prisma) {
  // get admin from system master
  const systemAdminConfig = await prisma.systemMaster.findFirst({
    where: {
      category: 'NOTIFICATION_EMAIL',
      code: 'CONTRACT_EXPIRING_ADMIN',
      isActive: true
    }
  });

  if (!systemAdminConfig) {
    console.warn('[Cron] Warning: Email admin tidak ditemukan di System Master (category=NOTIFICATION_EMAIL, code=CONTRACT_EXPIRING_ADMIN).');
  }

  // Email usually saved in name or description
  const adminEmail = systemAdminConfig ? (systemAdminConfig.name || systemAdminConfig.description) : null;
  
  let adminUsers = [];
  if (adminEmail) {
    // If the email is a comma separated list
    const emails = adminEmail.split(',').map(e => e.trim()).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { email: { in: emails } }
    });
    
    adminUsers = users;
    
    if (adminUsers.length === 0) {
      console.warn(`[Cron] Warning: User dengan email ${adminEmail} tidak ditemukan di database tb_m_user.`);
    }
  }

  const tz = process.env.APP_TIMEZONE || 'Asia/Jakarta';
  
  // We'll construct today's date in local/timezone, then map to UTC midnight
  const now = new Date();
  const todayString = now.toLocaleDateString('en-CA', { timeZone: tz }); // 'YYYY-MM-DD'
  const today = new Date(`${todayString}T00:00:00.000Z`);
  
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setUTCDate(thirtyDaysLater.getUTCDate() + 30);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  const contracts = await prisma.userContract.findMany({
    where: {
      endDate: {
        gte: thirtyDaysAgo,
        lte: thirtyDaysLater
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          projects: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  projectManager: { select: { id: true, name: true, email: true, role: true } }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { endDate: 'asc' }
  });

  const reminderDays = [30, 14, 7, 1, 0];
  let createdCount = 0;

  for (const contract of contracts) {
    // Both are UTC midnight dates, so dividing by 86400000 gives exact days
    const diffTime = contract.endDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (reminderDays.includes(diffDays)) {
      const projectManagers = contract.user.projects
        .map(item => item.project?.projectManager)
        .filter(Boolean);
      
      const recipients = [...adminUsers, ...projectManagers];
      const endDateText = contract.endDate.toISOString().slice(0, 10);
      
      const referenceType = `USER_CONTRACT_REMINDER_${diffDays}`;

      const notifications = await createBulkNotifications(prisma, recipients, {
        type: 'CONTRACT_EXPIRING',
        title: 'Kontrak Akan Berakhir',
        message: `Kontrak ${contract.user.name} akan berakhir pada ${endDateText}.`,
        detail: `Nomor kontrak: ${contract.contractNumber}. Vendor: ${contract.vendor}. Sisa waktu: ${diffDays} hari.`,
        referenceId: contract.id,
        referenceType: referenceType,
        skipDuplicate: true
      });
      
      createdCount += notifications.length;
    }
  }

  return { contractsChecked: contracts.length, notificationsCreated: createdCount };
}

module.exports = {
  generateContractExpiringNotifications
};
