import crypto from 'crypto';

const RAW_KEY = process.env.ENCRYPTION_KEY || '';
let KEY = null;

if (RAW_KEY) {
  KEY = Buffer.from(RAW_KEY, 'hex');
} else {
  console.warn(
    '[crypto] ENCRYPTION_KEY is missing. ' +
    'Falling back to a derived key from JWT_SECRET or default secret. ' +
    'For production security, set ENCRYPTION_KEY in backend/.env'
  );
  // Derive a consistent 32-byte key from JWT_SECRET so tokens survive restarts
  const baseSecret = process.env.JWT_SECRET || 'fallback_telecloud_secret_key_1234';
  KEY = crypto.createHash('sha256').update(baseSecret).digest();
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
