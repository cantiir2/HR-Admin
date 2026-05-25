const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET belum diset');
  }

  if (/^[a-f0-9]{64}$/i.test(secret)) {
    return Buffer.from(secret, 'hex');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

function encryptText(value) {
  if (value === undefined || value === null || value === '') return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64')
  ].join(':');
}

function decryptText(payload) {
  if (!payload) return null;

  const [ivBase64, authTagBase64, encryptedBase64] = payload.split(':');
  if (!ivBase64 || !authTagBase64 || !encryptedBase64) return null;

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivBase64, 'base64')
  );
  decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

function maskSensitiveNumber(value) {
  if (!value) return null;
  const text = String(value);
  if (text.length <= 4) return '*'.repeat(text.length);
  return `${'*'.repeat(Math.max(text.length - 4, 0))}${text.slice(-4)}`;
}

module.exports = { encryptText, decryptText, maskSensitiveNumber };
