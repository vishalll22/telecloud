import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { saveStorageCredentials, getStorageCredentials, disconnectStorage } from '../db.js';
import { verifyBotToken, verifyChannelAccess } from '../services/telegramService.js';
import { encrypt } from '../crypto.js';

const router = express.Router();
router.use(requireAuth);

router.get('/status', async (req, res) => {
  const creds = await getStorageCredentials(req.user.telegramId);
  res.json({ connected: !!creds });
});

router.post('/connect', async (req, res) => {
  const { botToken, channelId } = req.body;
  if (!botToken || !channelId) {
    return res.status(400).json({ error: 'botToken and channelId are both required' });
  }

  try {
    // Confirm the token is real and the bot can actually reach the channel
    // before we store anything.
    await verifyBotToken(botToken);
    await verifyChannelAccess(botToken, channelId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const encryptedToken = encrypt(botToken);
  await saveStorageCredentials(req.user.telegramId, encryptedToken, channelId);
  res.json({ connected: true });
});

router.post('/disconnect', async (req, res) => {
  await disconnectStorage(req.user.telegramId);
  res.json({ connected: false });
});

export default router;
