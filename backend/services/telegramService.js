// Telegram bots can download files up to 20MB through getFile.
// We keep a safety margin so re-downloads never fail.
export const CHUNK_SIZE = 18 * 1024 * 1024; // 18MB

function apiBase(token) {
  return `https://api.telegram.org/bot${token}`;
}
function fileBase(token) {
  return `https://api.telegram.org/file/bot${token}`;
}

/**
 * Verifies a bot token is valid and returns basic info about it (used when a
 * user connects their own bot in the app).
 */
export async function verifyBotToken(token) {
  const res = await fetch(`${apiBase(token)}/getMe`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Invalid bot token');
  return data.result; // { id, username, first_name, ... }
}

/**
 * Confirms the bot can actually post into the given channel (i.e. it was
 * added as an admin) before we trust it as this user's storage.
 */
export async function verifyChannelAccess(token, channelId) {
  const res = await fetch(`${apiBase(token)}/getChat?chat_id=${channelId}`);
  const data = await res.json();
  if (!data.ok) {
    const desc = data.description || '';
    if (desc.toLowerCase().includes('chat not found')) {
      throw new Error(
        'Telegram Error: "chat not found" — Your bot cannot see this channel yet! To fix: 1) Open your Telegram Channel. 2) Go to Channel Settings > Administrators > Add Admin. 3) Search for your Bot and add it with "Post Messages" permission. 4) If your bot IS added, verify the Channel ID begins with -100 (forward any message from the channel to @RawDataBot to double check exact ID).'
      );
    }
    throw new Error(
      desc ||
      'Could not access that channel. Make sure the bot was added as an admin.'
    );
  }
  return data.result;
}

/**
 * Uploads a single chunk (Buffer) to the given channel as a document, using
 * the caller's own bot token. Returns the Telegram file_id and message_id.
 */
export async function uploadChunk(token, channelId, buffer, filename) {
  const form = new FormData();
  form.append('chat_id', channelId);
  form.append('document', new Blob([buffer]), filename);
  form.append('caption', filename);

  const res = await fetch(`${apiBase(token)}/sendDocument`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  if (!data.ok) {
    throw new Error(`Telegram upload failed: ${data.description || 'unknown error'}`);
  }

  return {
    fileId: data.result.document.file_id,
    messageId: data.result.message_id,
  };
}

/**
 * Downloads a single chunk from Telegram given its file_id, using the
 * owning user's own bot token.
 */
export async function downloadChunk(token, fileId) {
  const infoRes = await fetch(`${apiBase(token)}/getFile?file_id=${fileId}`);
  const info = await infoRes.json();

  if (!info.ok) {
    throw new Error(`Telegram getFile failed: ${info.description || 'unknown error'}`);
  }

  const fileRes = await fetch(`${fileBase(token)}/${info.result.file_path}`);
  const arrayBuffer = await fileRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Deletes a message (and therefore the file) from the user's storage channel.
 */
export async function deleteChannelMessage(token, channelId, messageId) {
  await fetch(`${apiBase(token)}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: channelId, message_id: messageId }),
  });
}
