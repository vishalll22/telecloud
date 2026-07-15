import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  currentUser, logout, listFiles, getStats, uploadFile, downloadFile, downloadFileUrl, deleteFile,
  getStorageStatus, connectStorage, disconnectStorage, createFolder, updateFile,
} from '../api.js';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function getFileIcon(file) {
  if (file.isFolder) return '📁';
  const mime = file.mimeType || '';
  if (mime.includes('image/')) return '🖼️';
  if (mime.includes('video/')) return '🎬';
  if (mime.includes('audio/')) return '🎵';
  if (mime.includes('pdf') || file.name?.endsWith('.pdf')) return '📕';
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('archive')) return '📦';
  if (mime.includes('text/') || file.name?.endsWith('.txt') || file.name?.endsWith('.md') || file.name?.endsWith('.js')) return '📄';
  return '📎';
}

function ConnectStorage({ onConnected }) {
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await connectStorage(botToken.trim(), channelId.trim());
      onConnected();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="connect-storage-box" style={{ maxWidth: 660, margin: '40px auto', padding: '32px', background: 'var(--bg-raised)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚡</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, textAlign: 'center', marginBottom: 12 }}>
        Connect Your Telegram Storage Drive
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, textAlign: 'center', marginBottom: 20 }}>
        TeleCloud stores all your cloud files safely inside a private Telegram channel governed by your personal bot. Once connected, your credentials are saved and this setup screen automatically hides!
      </p>

      {/* Toggle Guide Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', color: 'var(--text)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>📖 {showGuide ? 'Hide Step-by-Step Setup Guide ▲' : 'Show Step-by-Step Setup Guide ▼'}</span>
        </button>
      </div>

      {/* Step-by-Step Setup Guide with 3 ID Types Explanation */}
      {showGuide && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '22px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: 24, textAlign: 'left', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🛠️ Step-by-Step Configuration Guide
            </span>
            <span style={{ fontSize: 11, background: 'rgba(95, 201, 141, 0.15)', color: 'var(--success)', border: '1px solid var(--success)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              Auto-hides when connected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: 'var(--accent)', display: 'block', fontSize: 14, marginBottom: 4 }}>Step 1: Get Your Bot Token</strong>
              1. Open Telegram and search for <strong>@BotFather</strong>.<br />
              2. Send the command <code>/newbot</code>.<br />
              3. Enter a display name (e.g. <code>My TeleCloud Drive</code>) and a username ending in <code>bot</code> (e.g. <code>mycloud_storage_bot</code>).<br />
              4. Copy the HTTP API Token provided (e.g., <code>123456789:ABC-DEF1234ghIkl-zyx...</code>).
            </div>

            <div>
              <strong style={{ color: 'var(--accent)', display: 'block', fontSize: 14, marginBottom: 4 }}>Step 2: Create Your Private Channel & Add Bot</strong>
              1. In Telegram, create a new <strong>Private Channel</strong>.<br />
              2. Go to Channel Settings → <strong>Administrators</strong> → Add your newly created bot as an Admin.<br />
              3. Ensure your bot has permission to post messages and edit messages.
            </div>

            <div>
              <strong style={{ color: 'var(--accent)', display: 'block', fontSize: 14, marginBottom: 6 }}>Step 3: Get Your Channel ID (Which of the 3 IDs is Correct?)</strong>
              Forward any post or message from your private channel to <strong>@RawDataBot</strong> (or <code>@idbot</code> / <code>@userinfobot</code>). When you check the response, bots often return <strong>3 different types of IDs or formats</strong>. Here is which one you MUST use:
              
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: 16 }}>✓</span>
                  <div>
                    <strong style={{ color: '#fff', fontSize: 13.5 }}>1. Full Numeric Supergroup ID with `-100` Prefix (CORRECT ENTRY)</strong><br />
                    Example: <code>-1001234567890</code><br />
                    <span style={{ fontSize: 12.5 }}>The Telegram Bot API strictly requires all private channel IDs to begin with <code>-100</code> followed by the 10 or 13 digits (look for <code>forward_from_chat.id</code> in @RawDataBot). <strong>Always paste this exact ID starting with -100 into the input below!</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: 16 }}>✕</span>
                  <div>
                    <strong style={{ color: '#fff', fontSize: 13.5 }}>2. Short Numeric ID without `-100` (DO NOT USE)</strong><br />
                    Example: <code>1234567890</code><br />
                    <span style={{ fontSize: 12.5 }}>If you paste an ID without the <code>-100</code> prefix, the Telegram API cannot identify your channel as a supergroup/channel and will fail with a "Chat not found" error.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: 16 }}>✕</span>
                  <div>
                    <strong style={{ color: '#fff', fontSize: 13.5 }}>3. Channel Invite Link or Username (DO NOT USE)</strong><br />
                    Example: <code>https://t.me/+AbCdEfGhI</code> or <code>@MyPrivateCloud</code><br />
                    <span style={{ fontSize: 12.5 }}>Private invite links or usernames cannot be used as an API Channel ID. Only the numeric <code>-100...</code> ID allows your bot to securely upload and retrieve chunks.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Telegram Bot Token</label>
          <input
            type="text"
            placeholder="e.g. 123456789:AAH...your_bot_token"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Telegram Channel ID</label>
          <input
            type="text"
            placeholder="e.g. -1001234567890"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', fontSize: 13, textAlign: 'center' }}>⚠️ {error}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy} style={{ padding: '14px', fontSize: 15, fontWeight: 600, marginTop: 8 }}>
          {busy ? 'Verifying Credentials…' : 'Connect Storage & Unlock Drive'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '12px 14px',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: 'var(--font-mono)',
  width: '100%',
  outline: 'none',
};

export default function Dashboard() {
  const user = currentUser();
  const navigate = useNavigate();
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [connected, setConnected] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Navigation & View State
  const [activeSection, setActiveSection] = useState('drive'); // 'drive' | 'starred' | 'trash'
  const [currentFolder, setCurrentFolder] = useState('/');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({ fileCount: 0, totalBytes: 0 });
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Drag & Drop / Uploads
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [minimizedUploads, setMinimizedUploads] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Modals & Prompts
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [renameModal, setRenameModal] = useState(null); // file object
  const [renameInput, setRenameInput] = useState('');
  const [previewFile, setPreviewFile] = useState(null); // file object
  const [toast, setToast] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const refresh = async () => {
    setLoadingFiles(true);
    try {
      const options = {
        trashed: activeSection === 'trash',
        starred: activeSection === 'starred' ? true : undefined,
        search: searchQuery,
      };
      const r = await listFiles(currentFolder, options);
      setFiles(r.files || []);
      const s = await getStats();
      setStats(s || { fileCount: 0, totalBytes: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    getStorageStatus()
      .then((r) => {
        setConnected(r.connected);
        if (r.connected) refresh();
      })
      .finally(() => setCheckingStorage(false));

    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [activeSection, currentFolder, searchQuery]);

  async function handleFiles(fileList, targetFolder = currentFolder) {
    if (!fileList || fileList.length === 0) return;
    const items = Array.from(fileList);
    for (const file of items) {
      const entry = { id: Math.random().toString(), name: file.name, progress: 0, status: 'uploading' };
      setUploads((u) => [...u, entry]);
      try {
        await uploadFile(file, targetFolder, (pct) => {
          setUploads((u) => u.map((x) => (x.id === entry.id ? { ...x, progress: pct } : x)));
        });
        setUploads((u) => u.map((x) => (x.id === entry.id ? { ...x, progress: 100, status: 'done' } : x)));
        showToast(`Uploaded "${file.name}" successfully!`);
      } catch (err) {
        setUploads((u) => u.map((x) => (x.id === entry.id ? { ...x, status: 'error', error: err.message } : x)));
        showToast(`Failed to upload ${file.name}: ${err.message}`);
      } finally {
        refresh();
      }
    }
  }

  async function handleCreateFolder(e) {
    e.preventDefault();
    if (!folderNameInput.trim()) return;
    try {
      await createFolder(folderNameInput.trim(), currentFolder);
      setFolderNameInput('');
      setNewFolderModal(false);
      showToast('New folder created!');
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleRename(e) {
    e.preventDefault();
    if (!renameModal || !renameInput.trim()) return;
    try {
      await updateFile(renameModal.id, { name: renameInput.trim() });
      setRenameModal(null);
      setRenameInput('');
      showToast('Item renamed successfully!');
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleToggleStar(file) {
    try {
      await updateFile(file.id, { starred: !file.starred });
      showToast(file.starred ? 'Removed from Starred' : 'Added to Starred!');
      refresh();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteOrRestore(file) {
    try {
      if (activeSection === 'trash') {
        if (confirm(`Permanently delete "${file.name}"? This will erase chunks from your Telegram channel.`)) {
          await deleteFile(file.id, true);
          showToast('File deleted permanently.');
          refresh();
        }
      } else {
        await deleteFile(file.id, false);
        showToast(`Moved "${file.name}" to Trash.`);
        refresh();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function handleRestore(file) {
    try {
      await updateFile(file.id, { trashed: false });
      showToast(`Restored "${file.name}" to My Drive!`);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect your storage? You will need to reconnect your bot credentials to access your files again (no files are deleted).")) return;
    await disconnectStorage();
    setConnected(false);
    setShowSettingsModal(false);
  }

  function handleFolderClick(folder) {
    const nextPath = currentFolder === '/' ? `/${folder.name}` : `${currentFolder}/${folder.name}`;
    setCurrentFolder(nextPath);
  }

  function renderBreadcrumbs() {
    const parts = currentFolder.split('/').filter(Boolean);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 500 }}>
        <button
          type="button"
          onClick={() => setCurrentFolder('/')}
          style={{ background: 'none', border: 'none', color: currentFolder === '/' ? 'var(--text)' : 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: '4px 6px', borderRadius: 6 }}
        >
          {activeSection === 'trash' ? '🗑️ Trash' : activeSection === 'starred' ? '⭐ Starred' : '☁️ My Drive'}
        </button>
        {parts.map((part, index) => {
          const path = '/' + parts.slice(0, index + 1).join('/');
          const isLast = index === parts.length - 1;
          return (
            <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <button
                type="button"
                onClick={() => !isLast && setCurrentFolder(path)}
                style={{ background: 'none', border: 'none', color: isLast ? 'var(--text)' : 'var(--accent)', cursor: isLast ? 'default' : 'pointer', fontWeight: isLast ? 600 : 400, padding: '4px 6px', borderRadius: 6 }}
              >
                {part}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  if (checkingStorage) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 16 }}>
        <span style={{ marginRight: 10 }}>⚡</span> Checking storage access…
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="dash-shell" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <header className="dash-header" style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-logo" style={{ fontSize: 20, fontWeight: 700 }}>☁️ TeleCloud Drive</div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '8px 16px' }}>Sign Out</button>
        </header>
        <ConnectStorage onConnected={() => { setConnected(true); refresh(); }} />
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', color: 'var(--text)', position: 'relative' }}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { if (e.clientX === 0 || e.clientY === 0) setDragActive(false); }}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
    >
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: 'var(--bg-card)', border: '1px solid var(--accent)', color: '#fff', padding: '12px 20px', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 9999, fontSize: 14, fontWeight: 500, animation: 'fadeIn 0.25s ease' }}>
          ✨ {toast}
        </div>
      )}

      {/* Global Drag & Drop Overlay */}
      {dragActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 15, 23, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '3px dashed var(--accent)', margin: 16, borderRadius: 24, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: 'float 2s infinite ease-in-out' }}>☁️</div>
          <h2 style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--text)', margin: 0 }}>Drop Files to Upload</h2>
          <p style={{ color: 'var(--accent)', fontSize: 16, marginTop: 8 }}>Uploading straight to: <strong>{currentFolder}</strong></p>
        </div>
      )}

      {/* Google Drive Top Header */}
      <header className="dashboard-header" style={{ height: 64, borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 100 }}>
        <div className="dashboard-header-left" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
            <span>☁️</span> TeleCloud <span style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 600, background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 6 }}>DRIVE</span>
          </div>

          {/* Search Bar */}
          <div className="dashboard-search-wrap" style={{ position: 'relative', width: 380 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search files and folders in Drive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 20, padding: '9px 16px 9px 40px', color: 'var(--text)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>×</button>
            )}
          </div>
        </div>

        <div className="dashboard-header-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {installPrompt && (
            <button
              onClick={handleInstall}
              style={{ background: 'var(--signal)', color: '#000', fontWeight: 600, padding: '7px 14px', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              📲 Install App
            </button>
          )}
          <div className="user-badge-wrap" style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
            <span style={{ fontWeight: 600 }}>{user?.firstName || 'User'}</span>
          </div>
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '8px', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', title: 'Storage Settings' }}
          >
            ⚙️
          </button>
          <button
            onClick={handleLogout}
            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Drive Layout: Sidebar + Content */}
      <div className="dashboard-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Google Drive Sidebar */}
        <aside className="dashboard-sidebar" style={{ width: 250, background: 'var(--bg-raised)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 14px' }}>
          <div>
            {/* New Button Dropdown */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', padding: '12px 14px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(76, 125, 255, 0.3)' }}
                >
                  <span style={{ fontSize: 18 }}>+</span> New File
                </button>
                <button
                  onClick={() => setNewFolderModal(true)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', borderRadius: 12, cursor: 'pointer', title: 'Create New Folder' }}
                >
                  📁+
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            </div>

            {/* Navigation Menu */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                onClick={() => { setActiveSection('drive'); setCurrentFolder('/'); setSearchQuery(''); }}
                style={{ ...navButtonStyle(activeSection === 'drive'), display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span>☁️</span> My Drive
              </button>
              <button
                onClick={() => { setActiveSection('starred'); setCurrentFolder('/'); setSearchQuery(''); }}
                style={{ ...navButtonStyle(activeSection === 'starred'), display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span>⭐</span> Starred
              </button>
              <button
                onClick={() => { setActiveSection('trash'); setCurrentFolder('/'); setSearchQuery(''); }}
                style={{ ...navButtonStyle(activeSection === 'trash'), display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span>🗑️</span> Trash
              </button>
            </nav>
          </div>

          {/* Storage Meter Box */}
          <div className="dashboard-storage-meter" style={{ background: 'rgba(0,0,0,0.25)', padding: 16, borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              <span>☁️</span> Storage Quota
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: '15%', height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              <strong style={{ color: '#fff' }}>{formatBytes(stats.totalBytes)}</strong> used
            </div>
            <div style={{ fontSize: 11, color: 'var(--success)' }}>
              ● Unlimited Telegram Drive
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <main className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '24px 32px' }}>
          {/* Sub-toolbar: Breadcrumbs + View Switcher */}
          <div className="dashboard-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: 14, border: '1px solid var(--border)' }}>
            {renderBreadcrumbs()}

            <div className="dashboard-toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{files.length} item{files.length !== 1 ? 's' : ''}</span>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 2, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ background: viewMode === 'grid' ? 'var(--accent)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  title="Grid View"
                >
                  🔲 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ background: viewMode === 'list' ? 'var(--accent)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--text-muted)', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  title="List View"
                >
                  ☰ List
                </button>
              </div>
            </div>
          </div>

          {/* Files / Folders Area */}
          {loadingFiles ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 15 }}>
              Loading cloud drive files…
            </div>
          ) : files.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: 20, padding: 48, textAlign: 'center', margin: '16px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📂</div>
              <h3 style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--text)', margin: 0 }}>
                {searchQuery ? 'No matching files found' : activeSection === 'trash' ? 'Trash is empty' : activeSection === 'starred' ? 'No starred files yet' : 'Folder is empty'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 360, margin: '8px 0 20px' }}>
                {searchQuery ? 'Try adjusting your search terms.' : activeSection === 'drive' ? 'Drag and drop files anywhere on this screen or click "+ New File" to start storing unlimited data.' : ''}
              </p>
              {activeSection === 'drive' && !searchQuery && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => fileInputRef.current.click()} className="btn btn-primary" style={{ padding: '10px 18px' }}>
                    Upload File
                  </button>
                  <button onClick={() => setNewFolderModal(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                    Create Folder
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => file.isFolder ? handleFolderClick(file) : setPreviewFile(file)}
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 160 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 36 }}>{getFileIcon(file)}</span>
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStar(file)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: file.starred ? 1 : 0.4 }}
                        title={file.starred ? 'Unstar' : 'Star'}
                      >
                        {file.starred ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                      {file.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>{file.isFolder ? 'Folder' : formatBytes(file.size)}</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Grid Action Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                    {!file.isFolder && !file.trashed && (
                      <button
                        onClick={() => downloadFile(file.id, file.name)}
                        style={cardActionStyle}
                        title="Download"
                      >
                        ⬇️
                      </button>
                    )}
                    <button
                      onClick={() => { setRenameModal(file); setRenameInput(file.name); }}
                      style={cardActionStyle}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    {file.trashed && (
                      <button
                        onClick={() => handleRestore(file)}
                        style={{ ...cardActionStyle, color: 'var(--success)' }}
                        title="Restore"
                      >
                        ♻️
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrRestore(file)}
                      style={{ ...cardActionStyle, color: 'var(--danger)' }}
                      title={file.trashed ? 'Delete Forever' : 'Move to Trash'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="dashboard-list-container" style={{ background: 'var(--bg-raised)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div className="dashboard-list-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 140px', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <span>Name</span>
                <span className="col-size">File Size</span>
                <span className="col-date">Date Added</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {files.map((file, i) => (
                  <div
                    key={file.id}
                    onClick={() => file.isFolder ? handleFolderClick(file) : setPreviewFile(file)}
                    className="dashboard-list-row"
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 140px', padding: '14px 20px', borderBottom: i === files.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                      <span style={{ fontSize: 20 }}>{getFileIcon(file)}</span>
                      <span style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStar(file); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: file.starred ? 1 : 0.3 }}
                      >
                        {file.starred ? '⭐' : '☆'}
                      </button>
                    </div>
                    <div className="col-size" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{file.isFolder ? '—' : formatBytes(file.size)}</div>
                    <div className="col-date" style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(file.createdAt).toLocaleDateString()}</div>
                    <div className="list-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      {!file.isFolder && !file.trashed && (
                        <button onClick={() => downloadFile(file.id, file.name)} style={cardActionStyle} title="Download">⬇️</button>
                      )}
                      <button onClick={() => { setRenameModal(file); setRenameInput(file.name); }} style={cardActionStyle} title="Rename">✏️</button>
                      {file.trashed && (
                        <button onClick={() => handleRestore(file)} style={{ ...cardActionStyle, color: 'var(--success)' }} title="Restore">♻️</button>
                      )}
                      <button onClick={() => handleDeleteOrRestore(file)} style={{ ...cardActionStyle, color: 'var(--danger)' }} title={file.trashed ? 'Delete Forever' : 'Trash'}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Upload Progress Widget */}
      {uploads.length > 0 && (
        <div className="floating-uploads-widget" style={{ position: 'fixed', bottom: 24, right: 24, width: 340, background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 1000 }}>
          <div style={{ background: 'var(--accent)', color: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 13 }}>
            <span>⚡ Uploading {uploads.filter((u) => u.status === 'uploading').length} item(s)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setMinimizedUploads(!minimizedUploads)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{minimizedUploads ? '□' : '_'}</button>
              <button onClick={() => setUploads((u) => u.filter((x) => x.status !== 'done'))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>×</button>
            </div>
          </div>
          {!minimizedUploads && (
            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {uploads.map((u) => (
                <div key={u.id} style={{ fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200, fontWeight: 500 }}>{u.name}</span>
                    <span style={{ color: u.status === 'error' ? 'var(--danger)' : u.status === 'done' ? 'var(--success)' : 'var(--text-muted)' }}>
                      {u.status === 'error' ? 'Failed' : u.status === 'done' ? '✓ Done' : `${u.progress}%`}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${u.progress}%`, background: u.status === 'error' ? 'var(--danger)' : 'var(--accent)', transition: 'width 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Folder Modal */}
      {newFolderModal && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: 18 }}>📁 Create New Folder</h3>
            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                placeholder="Folder Name (e.g. Work Projects)"
                value={folderNameInput}
                onChange={(e) => setFolderNameInput(e.target.value)}
                autoFocus
                style={inputStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setNewFolderModal(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Create Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div style={modalBackdropStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: 18 }}>✏️ Rename Item</h3>
            <form onSubmit={handleRename} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                autoFocus
                style={inputStyle}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setRenameModal(null)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Save Name</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div style={modalBackdropStyle} onClick={() => setPreviewFile(null)}>
          <div style={{ ...modalBoxStyle, maxWidth: 640, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 600 }}>
                <span>{getFileIcon(previewFile)}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>{previewFile.name}</span>
              </div>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ marginBottom: 16 }}>
                <strong>Size:</strong> {formatBytes(previewFile.size)} | <strong>Added:</strong> {new Date(previewFile.createdAt).toLocaleString()}
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
                {previewFile.mimeType?.includes('image/') ? (
                  <div style={{ color: 'var(--text)' }}>🖼️ Image ready for direct secure download from Telegram storage.</div>
                ) : (
                  <div style={{ color: 'var(--text)' }}>📄 File safely stored in your encrypted Telegram Drive.</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + downloadFileUrl(previewFile.id));
                  showToast('Download link copied to clipboard!');
                }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                🔗 Copy Direct Link
              </button>
              <button
                onClick={() => downloadFile(previewFile.id, previewFile.name)}
                className="btn btn-primary"
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                ⬇️ Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Settings Modal */}
      {showSettingsModal && (
        <div style={modalBackdropStyle} onClick={() => setShowSettingsModal(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: 20 }}>⚙️ Storage Settings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Your account is currently connected to your private Telegram storage channel. All uploads are chunked into 18MB encrypted blobs and posted to your bot.
            </p>
            <div style={{ background: 'rgba(95, 201, 141, 0.1)', border: '1px solid var(--success)', padding: '12px', borderRadius: 10, color: 'var(--success)', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✓</span> Connected to private Telegram Drive channel
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={handleDisconnect} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                Disconnect Storage
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// UI Styling Helpers
const navButtonStyle = (active) => ({
  background: active ? 'var(--bg-hover)' : 'transparent',
  color: active ? 'var(--text)' : 'var(--text-muted)',
  border: 'none',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s ease',
});

const cardActionStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid var(--border)',
  color: 'var(--text-muted)',
  padding: '6px 8px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  transition: 'all 0.15s ease',
};

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(6px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  animation: 'fadeIn 0.2s ease',
};

const modalBoxStyle = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  borderRadius: 18,
  padding: 28,
  width: '100%',
  maxWidth: 440,
  boxShadow: 'var(--shadow-lg)',
  animation: 'fadeIn 0.2s ease',
};

