import crypto from 'crypto';

// Requires a 32-byte key. Generate one with: openssl rand -hex 32
const RAW_KEY = process.env.ENCRYPTION_KEY || '';
const KEY = RAW_KEY ? Buffer.from(RAW_KEY, 'hex') : null;

if (!KEY || KEY.length !== 32) {
  console.warn(
    '[crypto] ENCRYPTION_KEY is missing or not a 32-byte hex string. ' +
    'Generate one with `openssl rand -hex 32` and set it in backend/.env — ' +
    'stored bot tokens cannot be encrypted without it.'
  );
}

export function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((b) => b.toString('base64')).join('.');
}

export function decrypt(payload) {
  const [ivB64, tagB64, dataB64] = payload.split('.');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}
