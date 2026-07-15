import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import {
  addFile, listFiles, getFile, deleteFile, storageStats, getStorageCredentials, createFolder, updateFile,
} from '../db.js';
import {
  uploadChunk, downloadChunk, deleteChannelMessage, CHUNK_SIZE,
} from '../services/telegramService.js';
import { decrypt } from '../crypto.js';

const router = express.Router();

// Files are held in memory only long enough to split + upload them.
// 2GB cap here is an MVP safety limit, not a Telegram limit.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
});

router.use(requireAuth);

// Every route below needs this user's own bot token + channel — reject
// early with a clear message if they haven't connected storage yet.
async function requireStorage(req, res, next) {
  const creds = await getStorageCredentials(req.user.telegramId);
  if (!creds) {
    return res.status(409).json({ error: 'Connect your Telegram storage first', code: 'NOT_CONNECTED' });
  }
  req.storage = { token: decrypt(creds.encryptedToken), channelId: creds.channelId };
  next();
}

router.get('/', requireStorage, async (req, res) => {
  const folder = req.query.folder || '/';
  const trashed = req.query.trashed === 'true';
  const starred = req.query.starred !== undefined ? req.query.starred === 'true' : undefined;
  const search = req.query.search || '';
  const files = await listFiles(req.user.telegramId, folder, { trashed, starred, search });
  res.json({ files });
});

router.post('/folder', requireStorage, async (req, res) => {
  const { name, folder = '/' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Folder name is required' });
  const record = {
    id: uuidv4(),
    ownerId: req.user.telegramId,
    name: name.trim(),
    folder,
    createdAt: new Date().toISOString(),
  };
  await createFolder(record);
  res.json({ folder: record });
});

router.get('/stats', requireStorage, async (req, res) => {
  const stats = await storageStats(req.user.telegramId);
  res.json(stats);
});

router.post('/upload', requireStorage, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const { originalname, mimetype, buffer, size } = req.file;
  const folder = req.body.folder || '/';
  const { token, channelId } = req.storage;
  const chunks = [];

  try {
    for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
      const chunkBuffer = buffer.subarray(offset, offset + CHUNK_SIZE);
      const partName = `${originalname}.part${chunks.length}`;
      const result = await uploadChunk(token, channelId, chunkBuffer, partName);
      chunks.push(result);
    }

    const record = {
      id: uuidv4(),
      ownerId: req.user.telegramId,
      name: originalname,
      mimeType: mimetype,
      size,
      folder,
      chunks, // [{ fileId, messageId }]
      createdAt: new Date().toISOString(),
    };

    await addFile(record);
    res.json({ file: record });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: `Upload to Telegram failed: ${err.message}` });
  }
});

router.get('/:id/download', requireStorage, async (req, res) => {
  const file = await getFile(req.params.id, req.user.telegramId);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const { token } = req.storage;

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
  res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
  res.setHeader('Content-Length', file.size);

  try {
    for (const chunk of file.chunks) {
      const buffer = await downloadChunk(token, chunk.fileId);
      res.write(buffer);
    }
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(502).json({ error: `Download from Telegram failed: ${err.message}` });
    } else {
      res.end();
    }
  }
});

router.put('/:id', requireStorage, async (req, res) => {
  const file = await updateFile(req.params.id, req.user.telegramId, req.body);
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json({ file });
});

router.delete('/:id', requireStorage, async (req, res) => {
  const file = await getFile(req.params.id, req.user.telegramId);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const permanent = req.query.permanent === 'true' || file.trashed;
  if (!permanent) {
    // Soft move to trash
    const updated = await updateFile(req.params.id, req.user.telegramId, { trashed: true });
    return res.json({ success: true, trashed: true, file: updated });
  }

  // Permanent delete
  const { token, channelId } = req.storage;
  if (file.chunks && file.chunks.length > 0) {
    await Promise.all(file.chunks.map((c) => deleteChannelMessage(token, channelId, c.messageId).catch(console.error)));
  }
  await deleteFile(req.params.id, req.user.telegramId);

  res.json({ success: true, permanent: true });
});

export default router;
