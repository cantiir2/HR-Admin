const nodemailer = require('nodemailer');

const SUBJECT_BY_TYPE = {
  CONTRACT_EXPIRING: 'Kontrak Akan Berakhir',
  WR_REMINDER: 'Reminder Pengiriman Working Report',
  WR_LATE: 'Working Report Terlambat',
  WR_SUBMITTED: 'Pengajuan Working Report Baru',
  WR_APPROVED: 'Working Report Disetujui',
  WR_REJECTED: 'Working Report Ditolak',
  LEAVE_REQUEST: 'Pengajuan Cuti Baru',
  LEAVE_APPROVAL: 'Pengajuan Cuti Disetujui',
  LEAVE_REJECTED: 'Pengajuan Cuti Ditolak',
  LEAVE_OVER_QUOTA: 'Peringatan Cuti Melebihi Jatah'
};

function isEmailEnabled() {
  return String(process.env.ENABLE_EMAIL_NOTIFICATION || '').toLowerCase() === 'true';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function getTransporter() {
  if (!isEmailEnabled()) return null;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/*****/
/** Nama Function: buildEmailTemplate **/
/** Deskripsi Function: Membuat template email notifikasi sistem **/
/** Creator by: FID.Iyan **/
/*****/
function buildEmailTemplate(data = {}) {
  const recipientName = data.recipientName || 'Bapak/Ibu';
  const detail = data.detail ? `<p style="margin:12px 0;color:#334155;">${escapeHtml(data.detail)}</p>` : '';
  const appLink = process.env.APP_URL
    ? `<p style="margin:20px 0;"><a href="${escapeHtml(process.env.APP_URL)}" style="display:inline-block;background:#dc002b;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Buka Aplikasi</a></p>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto;padding:24px;">
      <h2 style="margin:0 0 16px;color:#111827;">${escapeHtml(data.subject || 'Notifikasi')}</h2>
      <p style="margin:0 0 12px;">Halo ${escapeHtml(recipientName)},</p>
      <p style="margin:0;color:#334155;">${escapeHtml(data.message || '')}</p>
      ${detail}
      ${appLink}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="margin:0;color:#64748b;font-size:12px;">Email ini dikirim otomatis oleh Project Manager System.</p>
    </div>
  `;
}

/*****/
/** Nama Function: sendEmailNotification **/
/** Deskripsi Function: Mengirim email notifikasi ke penerima dari database **/
/** Creator by: FID.Iyan **/
/*****/
async function sendEmailNotification(data = {}) {
  if (!isEmailEnabled()) return { sent: false, skipped: true, reason: 'Email notification disabled' };
  if (!isValidEmail(data.to)) return { sent: false, skipped: true, reason: 'Invalid recipient email' };

  const transporter = getTransporter();
  if (!transporter) return { sent: false, skipped: true, reason: 'SMTP configuration incomplete' };

  const subject = data.subject || SUBJECT_BY_TYPE[data.type] || 'Notifikasi Project Manager';
  const html = buildEmailTemplate({
    subject,
    recipientName: data.recipientName,
    message: data.message,
    detail: data.detail
  });

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Project Manager System'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: data.to,
      subject,
      html
    });
    return { sent: true };
  } catch (error) {
    console.error('Email notification failed:', error.message);
    return { sent: false, error: error.message };
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  SUBJECT_BY_TYPE,
  buildEmailTemplate,
  sendEmailNotification
};
