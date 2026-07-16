const BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

function authHeaders() {
  const token = localStorage.getItem('telecloud_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse(res, defaultError) {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || defaultError);
    } else {
      const text = await res.text().catch(() => '');
      if (res.status === 405) {
        throw new Error(`Error 405 (Method Not Allowed): Your Vercel frontend sent a POST request to static Vercel (${res.url}) instead of your Render backend! To fix: In Vercel > Settings > Environment Variables, verify VITE_API_BASE_URL (or VITE_API_URL) is set to your Render URL ending in /api (e.g. https://your-backend.onrender.com/api). Then go to Deployments > Redeploy and UNCHECK 'Use existing build cache'.`);
      }
      if (res.status === 404 || text.includes('The page could not be found') || text.includes('Cannot POST') || text.includes('<html')) {
        throw new Error(`Server API endpoint not found (404). Make sure your Node backend server is running on Render and verify VITE_API_BASE_URL (or VITE_API_URL) in your Vercel environment settings, then redeploy without build cache.`);
      }
      throw new Error(`${defaultError} (Server status: ${res.status})`);
    }
  }
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return {};
}

export async function loginWithTelegram(telegramData) {
  const res = await fetch(`${BASE}/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telegramData),
  });
  const data = await parseResponse(res, 'Telegram login failed');
  localStorage.setItem('telecloud_token', data.token);
  localStorage.setItem('telecloud_user', JSON.stringify(data.user));
  return data.user;
}

export async function signupWithEmail(data) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await parseResponse(res, 'Signup failed');
  localStorage.setItem('telecloud_token', result.token);
  localStorage.setItem('telecloud_user', JSON.stringify(result.user));
  return result.user;
}

export async function loginWithEmail(data) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await parseResponse(res, 'Login failed');
  localStorage.setItem('telecloud_token', result.token);
  localStorage.setItem('telecloud_user', JSON.stringify(result.user));
  return result.user;
}

export async function loginWithStorage({ botToken, channelId }) {
  const res = await fetch(`${BASE}/auth/storage-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ botToken, channelId }),
  });
  const result = await parseResponse(res, 'Storage login failed');
  localStorage.setItem('telecloud_token', result.token);
  localStorage.setItem('telecloud_user', JSON.stringify(result.user));
  return result.user;
}

export async function forgotPassword(email) {
  const res = await fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await parseResponse(res, 'Failed to request recovery code');
}

export async function resetPassword({ email, code, newPassword }) {
  const res = await fetch(`${BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  return await parseResponse(res, 'Password reset failed');
}

export function logout() {
  localStorage.removeItem('telecloud_token');
  localStorage.removeItem('telecloud_user');
}

export function currentUser() {
  const raw = localStorage.getItem('telecloud_user');
  return raw ? JSON.parse(raw) : null;
}

export async function listFiles(folder = '/', options = {}) {
  const params = new URLSearchParams({ folder });
  if (options.trashed !== undefined) params.append('trashed', String(options.trashed));
  if (options.starred !== undefined) params.append('starred', String(options.starred));
  if (options.search) params.append('search', options.search);

  const res = await fetch(`${BASE}/files?${params.toString()}`, {
    headers: authHeaders(),
  });
  return await parseResponse(res, 'Failed to list files');
}

export async function getStats() {
  const res = await fetch(`${BASE}/files/stats`, { headers: authHeaders() });
  return await parseResponse(res, 'Failed to load stats');
}

export async function getStorageStatus() {
  const res = await fetch(`${BASE}/storage/status`, { headers: authHeaders() });
  return await parseResponse(res, 'Failed to check storage status');
}

export async function connectStorage(botToken, channelId) {
  const res = await fetch(`${BASE}/storage/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ botToken, channelId }),
  });
  return await parseResponse(res, 'Could not connect storage');
}

export async function disconnectStorage() {
  const res = await fetch(`${BASE}/storage/disconnect`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return await parseResponse(res, 'Could not disconnect storage');
}

export async function uploadFile(file, folder = '/', onProgress) {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/files/upload`);
    const token = localStorage.getItem('telecloud_token');
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          resolve({});
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || 'Upload failed'));
        } catch (err) {
          if (xhr.status === 404 || xhr.responseText.includes('The page could not be found')) {
            reject(new Error('Server API not found (404). Check backend deployment and VITE_API_URL.'));
          } else {
            reject(new Error(`Upload failed (Status: ${xhr.status})`));
          }
        }
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(form);
  });
}

export function downloadFileUrl(id) {
  return `${BASE}/files/${id}/download`;
}

export async function downloadFile(id, name) {
  const res = await fetch(`${BASE}/files/${id}/download`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function deleteFile(id, permanent = false) {
  const res = await fetch(`${BASE}/files/${id}?permanent=${permanent}`, { method: 'DELETE', headers: authHeaders() });
  return await parseResponse(res, 'Delete failed');
}

export async function createFolder(name, folder = '/') {
  const res = await fetch(`${BASE}/files/folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, folder }),
  });
  return await parseResponse(res, 'Create folder failed');
}

export async function updateFile(id, updates) {
  const res = await fetch(`${BASE}/files/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  return await parseResponse(res, 'Update failed');
}
