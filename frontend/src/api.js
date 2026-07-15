const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('telecloud_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginWithTelegram(telegramData) {
  const res = await fetch(`${BASE}/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telegramData),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  const data = await res.json();
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
  if (!res.ok) throw new Error((await res.json()).error || 'Signup failed');
  const result = await res.json();
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
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  const result = await res.json();
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
  if (!res.ok) throw new Error((await res.json()).error || 'Storage login failed');
  const result = await res.json();
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
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to request recovery code');
  return res.json();
}

export async function resetPassword({ email, code, newPassword }) {
  const res = await fetch(`${BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Password reset failed');
  return res.json();
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
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to list files');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE}/files/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function getStorageStatus() {
  const res = await fetch(`${BASE}/storage/status`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to check storage status');
  return res.json();
}

export async function connectStorage(botToken, channelId) {
  const res = await fetch(`${BASE}/storage/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ botToken, channelId }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Could not connect storage');
  return res.json();
}

export async function disconnectStorage() {
  const res = await fetch(`${BASE}/storage/disconnect`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Could not disconnect storage');
  return res.json();
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
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'));
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
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function createFolder(name, folder = '/') {
  const res = await fetch(`${BASE}/files/folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, folder }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Create folder failed');
  return res.json();
}

export async function updateFile(id, updates) {
  const res = await fetch(`${BASE}/files/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
  return res.json();
}
