import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, isSupabaseEnabled } from './supabaseClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'db.json');

const defaultData = { users: [], files: [] };
export const db = await JSONFilePreset(dbPath, defaultData);

/**
 * Helper to match user universally by ID, Telegram ID, or Email (Lowdb).
 */
function matchUser(u, identifier) {
  if (!u || !identifier) return false;
  const target = String(identifier).toLowerCase();
  if (u.id && String(u.id).toLowerCase() === target) return true;
  if (u.telegramId && String(u.telegramId).toLowerCase() === target) return true;
  if (u.email && String(u.email).toLowerCase() === target) return true;
  return false;
}

/**
 * Helper to map snake_case Supabase user object to camelCase for auth.js.
 */
function mapUserFromSupabase(u) {
  if (!u) return null;
  return {
    ...u,
    passwordHash: u.password_hash || u.passwordHash,
    telegramId: u.telegram_id || u.telegramId,
    firstName: u.first_name || u.firstName,
    photoUrl: u.photo_url || u.photoUrl,
    storageBotTokenEnc: u.storage_bot_token_enc || u.storageBotTokenEnc,
    storageChannelId: u.storage_channel_id || u.storageChannelId,
    resetToken: u.reset_token || u.resetToken,
    resetTokenExpires: u.reset_token_expires || u.resetTokenExpires,
  };
}

/**
 * Helper to map snake_case Supabase file object to camelCase.
 */
function mapFileFromSupabase(f) {
  if (!f) return null;
  return {
    ...f,
    ownerId: f.owner_id || f.ownerId,
    isFolder: Boolean(f.is_folder || f.isFolder),
    mimeType: f.mime_type || f.mimeType,
  };
}

/**
 * Find or create a user record from Telegram login data.
 */
export async function upsertUser(telegramUser) {
  if (isSupabaseEnabled) {
    const { data } = await supabase.from('users').select('*').eq('id', String(telegramUser.id)).maybeSingle();
    if (data) return mapUserFromSupabase(data);
    const newUser = {
      id: String(telegramUser.id),
      telegram_id: String(telegramUser.id),
      first_name: telegramUser.first_name,
      username: telegramUser.username || null,
      photo_url: telegramUser.photo_url || null,
      created_at: new Date().toISOString(),
    };
    const { data: inserted } = await supabase.from('users').insert(newUser).select('*').single();
    return mapUserFromSupabase(inserted || newUser);
  }

  await db.read();
  let user = db.data.users.find((u) => matchUser(u, telegramUser.id));
  if (!user) {
    user = {
      id: String(telegramUser.id),
      telegramId: telegramUser.id,
      firstName: telegramUser.first_name,
      username: telegramUser.username || null,
      photoUrl: telegramUser.photo_url || null,
      createdAt: new Date().toISOString(),
    };
    db.data.users.push(user);
    await db.write();
  }
  return user;
}

/**
 * Find or create a storage user from bot/channel login credentials.
 */
export async function upsertStorageUser({ id, firstName, username, storageBotTokenEnc, storageChannelId }) {
  if (isSupabaseEnabled) {
    const { data: existing } = await supabase.from('users').select('*')
      .or(`id.eq.${id},storage_channel_id.eq.${storageChannelId}`).maybeSingle();
    if (!existing) {
      const newUser = {
        id: String(id),
        telegram_id: String(id),
        first_name: firstName || 'Storage User',
        username: username || null,
        storage_bot_token_enc: storageBotTokenEnc,
        storage_channel_id: storageChannelId,
        created_at: new Date().toISOString(),
      };
      const { data: inserted } = await supabase.from('users').insert(newUser).select('*').single();
      return mapUserFromSupabase(inserted || newUser);
    } else {
      const updates = {
        storage_bot_token_enc: storageBotTokenEnc,
        storage_channel_id: storageChannelId,
        first_name: firstName || existing.first_name || 'Storage User',
        updated_at: new Date().toISOString(),
      };
      const { data: updated } = await supabase.from('users').update(updates).eq('id', existing.id).select('*').single();
      return mapUserFromSupabase(updated || { ...existing, ...updates });
    }
  }

  await db.read();
  let user = db.data.users.find(
    (u) => matchUser(u, id) || (u.storageChannelId && String(u.storageChannelId) === String(storageChannelId))
  );
  if (!user) {
    user = {
      id: String(id),
      telegramId: String(id),
      firstName: firstName || 'Storage User',
      username: username || null,
      photoUrl: null,
      storageBotTokenEnc,
      storageChannelId,
      createdAt: new Date().toISOString(),
    };
    db.data.users.push(user);
  } else {
    user.storageBotTokenEnc = storageBotTokenEnc;
    user.storageChannelId = storageChannelId;
    if (!user.firstName) user.firstName = firstName;
  }
  await db.write();
  return user;
}

/**
 * Find user by email address (case insensitive).
 */
export async function findUserByEmail(email) {
  if (isSupabaseEnabled) {
    const { data } = await supabase.from('users').select('*').ilike('email', String(email)).maybeSingle();
    return mapUserFromSupabase(data);
  }

  await db.read();
  return db.data.users.find((u) => u.email && u.email.toLowerCase() === String(email).toLowerCase());
}

/**
 * Create a new user with Email & Password.
 */
export async function createEmailUser({ email, passwordHash, salt, firstName, storageBotTokenEnc, storageChannelId }) {
  if (isSupabaseEnabled) {
    const user = {
      id: String(email).toLowerCase(),
      email: String(email).toLowerCase(),
      password_hash: passwordHash,
      salt,
      first_name: firstName || 'User',
      storage_bot_token_enc: storageBotTokenEnc || null,
      storage_channel_id: storageChannelId || null,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('users').insert(user).select('*').single();
    if (error && (error.code === '23505' || error.message.includes('unique'))) {
      throw new Error('An account with this email already exists.');
    }
    return mapUserFromSupabase(data || user);
  }

  await db.read();
  const existing = db.data.users.find((u) => u.email && u.email.toLowerCase() === String(email).toLowerCase());
  if (existing) throw new Error('An account with this email already exists.');

  const user = {
    id: String(email).toLowerCase(),
    email: String(email).toLowerCase(),
    passwordHash,
    salt,
    firstName: firstName || 'User',
    username: null,
    photoUrl: null,
    storageBotTokenEnc: storageBotTokenEnc || null,
    storageChannelId: storageChannelId || null,
    createdAt: new Date().toISOString(),
  };
  db.data.users.push(user);
  await db.write();
  return user;
}

/**
 * Update a user's password hash and salt.
 */
export async function updateUserPassword(email, passwordHash, salt) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('users').update({
      password_hash: passwordHash,
      salt,
      reset_token: null,
      reset_token_expires: null,
      updated_at: new Date().toISOString(),
    }).ilike('email', String(email)).select('*').single();
    if (error || !data) throw new Error('User not found.');
    return mapUserFromSupabase(data);
  }

  await db.read();
  const user = db.data.users.find((u) => u.email && u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) throw new Error('User not found.');
  user.passwordHash = passwordHash;
  user.salt = salt;
  delete user.resetToken;
  delete user.resetTokenExpires;
  await db.write();
  return user;
}

/**
 * Set a password reset code for an email user.
 */
export async function setResetToken(email, token, expiresAt) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('users').update({
      reset_token: token,
      reset_token_expires: expiresAt,
      updated_at: new Date().toISOString(),
    }).ilike('email', String(email)).select('*').single();
    if (error || !data) throw new Error('No account found with this email.');
    return mapUserFromSupabase(data);
  }

  await db.read();
  const user = db.data.users.find((u) => u.email && u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) throw new Error('No account found with this email.');
  user.resetToken = token;
  user.resetTokenExpires = expiresAt;
  await db.write();
  return user;
}

/**
 * Get password reset code and expiration for an email user.
 */
export async function getResetToken(email) {
  if (isSupabaseEnabled) {
    const { data } = await supabase.from('users').select('reset_token, reset_token_expires').ilike('email', String(email)).maybeSingle();
    if (!data || !data.reset_token) return null;
    return { token: data.reset_token, expiresAt: data.reset_token_expires };
  }

  await db.read();
  const user = db.data.users.find((u) => u.email && u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !user.resetToken) return null;
  return { token: user.resetToken, expiresAt: user.resetTokenExpires };
}

/**
 * Clear reset token after successful reset.
 */
export async function clearResetToken(email) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('users').update({ reset_token: null, reset_token_expires: null }).ilike('email', String(email));
    return !error;
  }

  await db.read();
  const user = db.data.users.find((u) => u.email && u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return false;
  delete user.resetToken;
  delete user.resetTokenExpires;
  await db.write();
  return true;
}

export async function listFiles(ownerId, folder = '/', options = {}) {
  const { trashed = false, starred, search } = options;

  if (isSupabaseEnabled) {
    let query = supabase.from('files').select('*').eq('owner_id', String(ownerId)).eq('trashed', Boolean(trashed));
    if (starred !== undefined) query = query.eq('starred', Boolean(starred));
    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,folder.ilike.%${search.trim()}%`);
    } else {
      query = query.eq('folder', folder);
    }
    const { data, error } = await query.order('is_folder', { ascending: false }).order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapFileFromSupabase);
  }

  await db.read();
  return db.data.files
    .filter((f) => {
      if (String(f.ownerId) !== String(ownerId)) return false;
      if (Boolean(f.trashed) !== Boolean(trashed)) return false;
      if (starred !== undefined && Boolean(f.starred) !== Boolean(starred)) return false;
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        return f.name.toLowerCase().includes(q) || (f.folder && f.folder.toLowerCase().includes(q));
      }
      return f.folder === folder;
    })
    .sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

export async function addFile(fileRecord) {
  fileRecord.ownerId = String(fileRecord.ownerId);
  fileRecord.starred = false;
  fileRecord.trashed = false;

  if (isSupabaseEnabled) {
    const row = {
      id: fileRecord.id,
      owner_id: fileRecord.ownerId,
      name: fileRecord.name,
      folder: fileRecord.folder || '/',
      size: fileRecord.size || 0,
      mime_type: fileRecord.mimeType || null,
      is_folder: Boolean(fileRecord.isFolder),
      starred: false,
      trashed: false,
      created_at: fileRecord.createdAt || new Date().toISOString(),
    };
    await supabase.from('files').insert(row);
    if (fileRecord.chunks && fileRecord.chunks.length > 0) {
      const chunkRows = fileRecord.chunks.map((c, idx) => ({
        id: `${fileRecord.id}_${idx}`,
        file_id: fileRecord.id,
        chunk_index: idx,
        message_id: c.messageId,
        file_id_tg: c.fileId || null,
        size: c.size || 0,
      }));
      await supabase.from('file_chunks').insert(chunkRows);
    }
    return fileRecord;
  }

  await db.read();
  db.data.files.push(fileRecord);
  await db.write();
  return fileRecord;
}

export async function createFolder(folderRecord) {
  folderRecord.ownerId = String(folderRecord.ownerId);
  folderRecord.isFolder = true;
  folderRecord.size = 0;
  folderRecord.chunks = [];
  folderRecord.starred = false;
  folderRecord.trashed = false;

  if (isSupabaseEnabled) {
    const row = {
      id: folderRecord.id,
      owner_id: folderRecord.ownerId,
      name: folderRecord.name,
      folder: folderRecord.folder || '/',
      size: 0,
      is_folder: true,
      starred: false,
      trashed: false,
      created_at: folderRecord.createdAt || new Date().toISOString(),
    };
    await supabase.from('files').insert(row);
    return mapFileFromSupabase(row);
  }

  await db.read();
  db.data.files.push(folderRecord);
  await db.write();
  return folderRecord;
}

export async function updateFile(id, ownerId, updates) {
  if (isSupabaseEnabled) {
    const rowUpdates = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.folder !== undefined) rowUpdates.folder = updates.folder;
    if (updates.starred !== undefined) rowUpdates.starred = Boolean(updates.starred);
    if (updates.trashed !== undefined) rowUpdates.trashed = Boolean(updates.trashed);
    rowUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase.from('files').update(rowUpdates)
      .eq('id', id).eq('owner_id', String(ownerId)).select('*').maybeSingle();
    if (error || !data) return null;
    return mapFileFromSupabase(data);
  }

  await db.read();
  const file = db.data.files.find((f) => f.id === id && String(f.ownerId) === String(ownerId));
  if (!file) return null;
  if (updates.name !== undefined) file.name = updates.name;
  if (updates.folder !== undefined) file.folder = updates.folder;
  if (updates.starred !== undefined) file.starred = Boolean(updates.starred);
  if (updates.trashed !== undefined) file.trashed = Boolean(updates.trashed);
  file.updatedAt = new Date().toISOString();
  await db.write();
  return file;
}

export async function getFile(id, ownerId) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('files').select('*').eq('id', id).eq('owner_id', String(ownerId)).maybeSingle();
    if (error || !data) return null;
    const fileObj = mapFileFromSupabase(data);
    if (!fileObj.isFolder) {
      const { data: chunks } = await supabase.from('file_chunks').select('*').eq('file_id', id).order('chunk_index', { ascending: true });
      if (chunks && chunks.length > 0) {
        fileObj.chunks = chunks.map((c) => ({
          messageId: c.message_id,
          fileId: c.file_id_tg,
          size: c.size,
        }));
      }
    }
    return fileObj;
  }

  await db.read();
  return db.data.files.find((f) => f.id === id && String(f.ownerId) === String(ownerId));
}

export async function deleteFile(id, ownerId) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('files').delete().eq('id', id).eq('owner_id', String(ownerId));
    return !error;
  }

  await db.read();
  const before = db.data.files.length;
  db.data.files = db.data.files.filter(
    (f) => !(f.id === id && String(f.ownerId) === String(ownerId))
  );
  await db.write();
  return db.data.files.length < before;
}

export async function storageStats(ownerId) {
  if (isSupabaseEnabled) {
    const { data } = await supabase.from('files').select('size').eq('owner_id', String(ownerId)).eq('trashed', false).eq('is_folder', false);
    if (!data) return { fileCount: 0, totalBytes: 0 };
    return {
      fileCount: data.length,
      totalBytes: data.reduce((sum, f) => sum + (Number(f.size) || 0), 0),
    };
  }

  await db.read();
  const files = db.data.files.filter((f) => String(f.ownerId) === String(ownerId) && !f.trashed && !f.isFolder);
  return {
    fileCount: files.length,
    totalBytes: files.reduce((sum, f) => sum + f.size, 0),
  };
}

/**
 * Saves a user's own bot token + channel ID (already encrypted by the caller).
 */
export async function saveStorageCredentials(ownerId, encryptedToken, channelId) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabase.from('users').update({
      storage_bot_token_enc: encryptedToken,
      storage_channel_id: channelId,
      updated_at: new Date().toISOString(),
    }).eq('id', String(ownerId)).select('*').maybeSingle();
    if (error || !data) throw new Error('User not found');
    return mapUserFromSupabase(data);
  }

  await db.read();
  const user = db.data.users.find((u) => matchUser(u, ownerId));
  if (!user) throw new Error('User not found');
  user.storageBotTokenEnc = encryptedToken;
  user.storageChannelId = channelId;
  await db.write();
  return user;
}

export async function getStorageCredentials(ownerId) {
  if (isSupabaseEnabled) {
    const { data } = await supabase.from('users').select('storage_bot_token_enc, storage_channel_id').eq('id', String(ownerId)).maybeSingle();
    if (!data || !data.storage_bot_token_enc || !data.storage_channel_id) return null;
    return { encryptedToken: data.storage_bot_token_enc, channelId: data.storage_channel_id };
  }

  await db.read();
  const user = db.data.users.find((u) => matchUser(u, ownerId));
  if (!user || !user.storageBotTokenEnc || !user.storageChannelId) return null;
  return { encryptedToken: user.storageBotTokenEnc, channelId: user.storageChannelId };
}

export async function disconnectStorage(ownerId) {
  if (isSupabaseEnabled) {
    const { error } = await supabase.from('users').update({
      storage_bot_token_enc: null,
      storage_channel_id: null,
      updated_at: new Date().toISOString(),
    }).eq('id', String(ownerId));
    return !error;
  }

  await db.read();
  const user = db.data.users.find((u) => matchUser(u, ownerId));
  if (!user) return false;
  delete user.storageBotTokenEnc;
  delete user.storageChannelId;
  await db.write();
  return true;
}
