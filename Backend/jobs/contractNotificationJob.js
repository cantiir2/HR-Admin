const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { generateContractExpiringNotifications } = require('../services/contractNotificationService');

const prisma = new PrismaClient();

/*****/
/** Nama Function: startContractNotificationJob **/
/** Deskripsi Function: Menjalankan cronjob notifikasi kontrak expired secara otomatis **/
/** Creator by: FID.Iyan **/
/*****/
function startContractNotificationJob() {
  if (process.env.ENABLE_CRON_JOBS !== 'true') {
    console.log('[Cron] Contract Notification Job is disabled (ENABLE_CRON_JOBS is not true).');
    return;
  }

  const schedule = process.env.CONTRACT_EXPIRING_CRON || '0 8 * * *';
  const timezone = process.env.APP_TIMEZONE || 'Asia/Jakarta';

  cron.schedule(schedule, async () => {
    console.log(`[Cron] Running generateContractExpiringNotifications at ${new Date().toISOString()}`);
    try {
      const result = await generateContractExpiringNotifications(prisma);
      console.log(`[Cron] Success: Checked ${result.contractsChecked} contracts, created ${result.notificationsCreated} notifications.`);
    } catch (error) {
      console.error('[Cron] Error generating contract expiring notifications:', error);
    }
  }, {
    scheduled: true,
    timezone: timezone
  });
  
  console.log(`[Cron] Contract Notification Job scheduled with schedule: '${schedule}' (${timezone})`);
}

module.exports = {
  startContractNotificationJob
};
