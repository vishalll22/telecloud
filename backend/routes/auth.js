import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import {
  upsertUser,
  upsertStorageUser,
  findUserByEmail,
  createEmailUser,
  updateUserPassword,
  setResetToken,
  getResetToken,
  clearResetToken,
} from '../db.js';
import { encrypt } from '../crypto.js';
import { verifyBotToken, verifyChannelAccess } from '../services/telegramService.js';

const router = express.Router();

/**
 * Verifies the hash Telegram sends with its Login Widget data.
 * https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(data) {
  const { hash, ...fields } = data;
  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_AUTH_BOT_TOKEN)
    .digest();

  const checkString = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key]}`)
    .join('\n');

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  if (computedHash !== hash) return false;

  // Reject stale login attempts (older than 1 day)
  const authAge = Date.now() / 1000 - Number(data.auth_date);
  if (authAge > 86400) return false;

  return true;
}

router.post('/telegram', async (req, res) => {
  const data = req.body;

  if (!verifyTelegramAuth(data)) {
    return res.status(401).json({ error: 'Telegram login verification failed' });
  }

  const allowList = (process.env.ALLOWED_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowList.length > 0 && !allowList.includes(String(data.id))) {
    return res.status(403).json({ error: 'This Telegram account is not authorized' });
  }

  const user = await upsertUser({
    id: data.id,
    first_name: data.first_name,
    username: data.username,
    photo_url: data.photo_url,
  });

  const token = jwt.sign(
    { userId: user.id, telegramId: user.telegramId, firstName: user.firstName, username: user.username },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );

  res.json({ token, user });
});

/**
 * Email & Password Signup
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, botToken, channelId } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

    let storageBotTokenEnc = null;
    if (botToken && channelId) {
      try {
        storageBotTokenEnc = encrypt(botToken.trim());
      } catch (err) {
        console.error('Failed to encrypt bot token during signup:', err);
      }
    }

    const user = await createEmailUser({
      email: email.trim(),
      passwordHash,
      salt,
      firstName: firstName ? firstName.trim() : 'User',
      storageBotTokenEnc,
      storageChannelId: channelId ? channelId.trim() : null,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, firstName: user.firstName },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    const { passwordHash: _, salt: __, resetToken: ___, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Email & Password Login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash || !user.salt) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const computedHash = crypto.scryptSync(password, user.salt, 64).toString('hex');
    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, firstName: user.firstName },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    const { passwordHash: _, salt: __, resetToken: ___, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Forgot Password - Generate Recovery Code
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await setResetToken(email, code, expiresAt);

    res.json({
      success: true,
      message: 'Recovery code generated successfully.',
      demoCode: code, // Displayed in UI since we don't have an SMTP server configured
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reset Password - Verify Code & Set New Password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const resetData = await getResetToken(email);
    if (!resetData || resetData.token !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid or expired recovery code.' });
    }
    if (Date.now() > resetData.expiresAt) {
      return res.status(400).json({ error: 'Recovery code has expired. Please request a new one.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(newPassword, salt, 64).toString('hex');

    await updateUserPassword(email, passwordHash, salt);

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Storage / Channel Bot ID Login
 */
router.post('/storage-login', async (req, res) => {
  try {
    const { botToken, channelId } = req.body;
    if (!botToken || !channelId) {
      return res.status(400).json({ error: 'Bot Token and Channel ID are both required.' });
    }
    const tokenStr = botToken.trim();
    const channelStr = channelId.trim();

    // Verify token and channel access against Telegram
    const botInfo = await verifyBotToken(tokenStr);
    await verifyChannelAccess(tokenStr, channelStr);

    const encryptedToken = encrypt(tokenStr);
    const user = await upsertStorageUser({
      id: `bot_${botInfo.id}`,
      firstName: botInfo.first_name || 'Drive',
      username: botInfo.username || null,
      storageBotTokenEnc: encryptedToken,
      storageChannelId: channelStr,
    });

    const token = jwt.sign(
      { userId: user.id, telegramId: user.id, firstName: user.firstName, username: user.username, storageAuth: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    const { storageBotTokenEnc: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Could not log in with those bot credentials' });
  }
});

export default router;
