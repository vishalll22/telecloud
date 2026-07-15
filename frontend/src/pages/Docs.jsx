import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const sections = [
  { id: 'architecture', label: 'Two-Bot Architecture', icon: '🏛️' },
  { id: 'operator-setup', label: 'Site Operator Setup', icon: '⚙️' },
  { id: 'user-setup', label: 'Connecting Storage', icon: '🔑' },
  { id: 'running', label: 'Running & Deploying', icon: '🚀' },
  { id: 'install', label: 'Installing PWA App', icon: '📱' },
  { id: 'api', label: 'API Reference', icon: '📡' },
  { id: 'privacy', label: 'Privacy & Limits', icon: '🛡️' },
];

const apiEndpoints = [
  { method: 'POST', path: '/api/auth/telegram', desc: 'Verify Telegram login widget payload, returns a signed JWT session.' },
  { method: 'GET', path: '/api/storage/status', desc: 'Check whether the authenticated account has connected its own storage bot.' },
  { method: 'POST', path: '/api/storage/connect', desc: '{ botToken, channelId } — verifies Telegram channel access + saves encrypted.' },
  { method: 'POST', path: '/api/storage/disconnect', desc: 'Permanently removes the saved storage credentials from the database.' },
  { method: 'GET', path: '/api/files?folder=/', desc: 'List files and subdirectories within a specific virtual folder path.' },
  { method: 'POST', path: '/api/files/upload', desc: 'Upload a file (multipart/form-data: file, folder). Auto-chunks into 18MB parts.' },
  { method: 'GET', path: '/api/files/:id/download', desc: 'Stream download a file by ID, reconstructing Telegram chunks on the fly.' },
  { method: 'DELETE', path: '/api/files/:id', desc: 'Permanently delete a file and all underlying Telegram message chunks.' },
  { method: 'GET', path: '/api/files/stats', desc: 'Retrieve total file count and aggregate bytes stored across your channel.' },
];

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-card">
      {label && (
        <div className="code-header">
          <span className="code-label">{label}</span>
          <button onClick={handleCopy} className="btn-copy" aria-label="Copy code">
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}
      <pre className="code-block"><code>{code}</code></pre>
      {!label && (
        <button onClick={handleCopy} className="btn-copy-floating" aria-label="Copy code">
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      )}
    </div>
  );
}

export default function Docs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('architecture');

  const filteredSections = sections.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="docs-shell container">
        <div className="docs-header text-center">
          <div className="eyebrow"><span className="signal-dot"></span> DOCUMENTATION & ARCHITECTURE</div>
          <h1>How TeleCloud Works Under The Hood.</h1>
          <p className="lead">
            Everything you need to know about setting up, self-hosting, and integrating with TeleCloud—an open-source application under Bestdio.
          </p>
          
          {/* Search Filter Bar */}
          <div className="docs-search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search docs (e.g., API, BotFather, PWA, encryption)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear">✕</button>
            )}
          </div>
        </div>

        <div className="docs-layout">
          {/* Sticky Sidebar */}
          <aside className="docs-nav">
            <div className="sidebar-title">TOPICS</div>
            {filteredSections.length > 0 ? (
              filteredSections.map((s) => (
                <a 
                  key={s.id} 
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`docs-nav-link ${activeSection === s.id ? 'active' : ''}`}
                >
                  <span className="nav-icon">{s.icon}</span>
                  <span>{s.label}</span>
                </a>
              ))
            ) : (
              <div className="no-results-sidebar">No matching topics found.</div>
            )}

            <div className="sidebar-bestdio-box">
              <span className="bestdio-badge-mini">✨ Bestdio Ecosystem</span>
              <p>Want to build custom tools on top of TeleCloud? Check out our open-source repositories.</p>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-block">
                GitHub Repos ↗
              </a>
            </div>
          </aside>

          {/* Main Docs Content */}
          <div className="docs-content">
            {/* Section 1: Architecture */}
            <section id="architecture" className="doc-section">
              <h2><span className="doc-icon">🏛️</span> Two-Bot Architecture</h2>
              <p>
                TeleCloud uses a revolutionary <strong>Two-Bot Architecture</strong> designed by Bestdio to ensure that logging into the application and storing files never share the same security credentials or permission scope:
              </p>
              
              <div className="arch-flow-grid">
                <div className="arch-card">
                  <div className="arch-header">
                    <span className="arch-badge badge-blue">BOT #1: SHARED</span>
                    <h3>The Login Bot</h3>
                  </div>
                  <p>
                    One shared bot created once by whoever hosts the site. It powers the official <strong>Telegram Login Widget</strong>. Its only job is to cryptographically verify who you are and issue a session JWT. <em>It never touches or has permission to read files.</em>
                  </p>
                </div>
                
                <div className="arch-arrow">→</div>

                <div className="arch-card">
                  <div className="arch-header">
                    <span className="arch-badge badge-gold">BOT #2: PERSONAL</span>
                    <h3>Your Storage Bot</h3>
                  </div>
                  <p>
                    A personal bot and private channel you create yourself in @BotFather. Every file you upload is sliced into 18MB parts and posted to your private channel. <em>Only your personal bot can read or write to this channel—isolated from every other account.</em>
                  </p>
                </div>
              </div>

              <div className="highlight-callout mt-4">
                <div className="callout-icon">💡</div>
                <div>
                  <strong>Why this matters:</strong>
                  <p>This means the site operator (even if hosted on a public server) never has access to anyone's cloud files, and no two users ever share a storage pool or database table.</p>
                </div>
              </div>
            </section>

            <hr className="doc-divider" />

            {/* Section 2: Operator Setup */}
            <section id="operator-setup" className="doc-section">
              <h2><span className="doc-icon">⚙️</span> One-Time Site Setup (For Site Operators)</h2>
              <p>
                If you are self-hosting TeleCloud on your own server or VPS, perform this one-time setup to configure the authentication engine:
              </p>
              <ol className="doc-steps">
                <li>
                  <strong>Create the Login Bot:</strong> Message <strong>@BotFather</strong> on Telegram → send <code>/newbot</code> → name your bot and save the API token.
                </li>
                <li>
                  <strong>Configure Domain:</strong> Run <code>/setdomain</code> in @BotFather, select your login bot, and point it at the domain or URL where your frontend will be hosted.
                </li>
                <li>
                  <strong>Generate Server Encryption Key:</strong> Generate a 256-bit hexadecimal key to encrypt users' storage credentials at rest:
                  <CodeBlock code="openssl rand -hex 32" label="Terminal — Generate AES Key" />
                </li>
                <li>
                  <strong>Configure Backend Environment:</strong> Fill these values into your `backend/.env` file:
                  <CodeBlock 
                    label="backend/.env"
                    code={`PORT=4000
TELEGRAM_AUTH_BOT_TOKEN=123456789:AAF_abcdefghijklmnopqrstuvwxyz
TELEGRAM_AUTH_BOT_USERNAME=MyTeleCloudAuthBot
JWT_SECRET=your_super_secret_jwt_signing_key_here
ENCRYPTION_KEY=your_generated_32_byte_hex_key_here
ALLOWED_USER_IDS=   # Optional: comma-separated Telegram IDs to restrict access`} 
                  />
                </li>
                <li>
                  <strong>Configure Frontend Environment:</strong> Fill `frontend/.env`:
                  <CodeBlock 
                    label="frontend/.env"
                    code={`VITE_TELEGRAM_AUTH_BOT_USERNAME=MyTeleCloudAuthBot`} 
                  />
                </li>
              </ol>
            </section>

            <hr className="doc-divider" />

            {/* Section 3: User Setup */}
            <section id="user-setup" className="doc-section">
              <h2><span className="doc-icon">🔑</span> Connecting Your Storage (Every User Does This)</h2>
              <p>
                After logging in via the Telegram widget on your first visit, the dashboard will prompt you to connect your personal cloud storage. Here is the exact step-by-step workflow:
              </p>
              
              <div className="setup-steps-grid">
                <div className="setup-step-card">
                  <div className="step-num">1</div>
                  <h4>Create Your Storage Bot</h4>
                  <p>Message <strong>@BotFather</strong> → send <code>/newbot</code> → choose any name (e.g., "My Cloud Storage Bot") → copy the generated bot token.</p>
                </div>
                <div className="setup-step-card">
                  <div className="step-num">2</div>
                  <h4>Create a Private Channel</h4>
                  <p>In Telegram, create a new <strong>Private Channel</strong> (e.g., "☁️ My TeleCloud Drive"). Add your newly created bot as an <strong>Administrator</strong> with post permissions.</p>
                </div>
                <div className="setup-step-card">
                  <div className="step-num">3</div>
                  <h4>Get Your Channel ID</h4>
                  <p>Forward any message from your private channel to <strong>@RawDataBot</strong> or <strong>@username_to_id_bot</strong> to read your numeric channel ID (starts with <code>-100...</code>).</p>
                </div>
                <div className="setup-step-card">
                  <div className="step-num">4</div>
                  <h4>Connect in Dashboard</h4>
                  <p>Paste both your Bot Token and Channel ID into the TeleCloud dashboard form. The app verifies access before saving and encrypting your credentials.</p>
                </div>
              </div>
            </section>

            <hr className="doc-divider" />

            {/* Section 4: Running */}
            <section id="running" className="doc-section">
              <h2><span className="doc-icon">🚀</span> Running & Deploying the App</h2>
              <p>To run TeleCloud locally for development or deploy to production servers:</p>
              
              <h3>Backend Development Server</h3>
              <CodeBlock 
                label="Terminal — Backend"
                code={`cd backend
npm install
npm run dev     # Server starts on http://localhost:4000`} 
              />

              <h3>Frontend Development Server</h3>
              <CodeBlock 
                label="Terminal — Frontend"
                code={`cd frontend
npm install
npm run dev     # Vite app starts on http://localhost:5173`} 
              />

              <h3>Production Deployment Guidelines</h3>
              <ul>
                <li><strong>Backend:</strong> Deploy to any Node.js environment (Docker, Railway, Render, VPS, or AWS). Ensure all environment variables are populated.</li>
                <li><strong>Frontend:</strong> Build the static bundle with <code>npm run build</code> in the frontend directory. Serve the generated <code>dist/</code> folder via Nginx, Cloudflare Pages, or Vercel, proxying `/api` requests to your backend URL.</li>
              </ul>
            </section>

            <hr className="doc-divider" />

            {/* Section 5: Install PWA */}
            <section id="install" className="doc-section">
              <h2><span className="doc-icon">📱</span> Installing as a Progressive Web App (PWA)</h2>
              <p>
                TeleCloud is engineered by Bestdio as an installable Progressive Web App (PWA). Once logged in and connected, your web browser will offer an "Install App" prompt in the address bar—or you can click the **Install App** button in the dashboard header.
              </p>
              <div className="pwa-benefits-grid">
                <div className="pwa-card">
                  <h4>💻 Native Desktop App</h4>
                  <p>On macOS and Windows, TeleCloud opens in its own standalone application window with a dock/taskbar icon, completely separate from your browser tabs.</p>
                </div>
                <div className="pwa-card">
                  <h4>📱 Mobile Home Screen</h4>
                  <p>On iOS (Safari → Share → Add to Home Screen) and Android (Chrome → Install App), TeleCloud feels like a native mobile app with full-screen file browsing.</p>
                </div>
              </div>
            </section>

            <hr className="doc-divider" />

            {/* Section 6: API Reference */}
            <section id="api" className="doc-section">
              <h2><span className="doc-icon">📡</span> REST API Reference</h2>
              <p>
                TeleCloud exposes a clean, developer-friendly REST API. All endpoints (except login) require an Authorization header: <code>Authorization: Bearer &lt;jwt_token&gt;</code>.
              </p>

              <div className="api-table-wrapper">
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Endpoint Path</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((ep, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`method-badge method-${ep.method.toLowerCase()}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td><code className="api-path">{ep.path}</code></td>
                        <td>{ep.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <hr className="doc-divider" />

            {/* Section 7: Privacy & Limits */}
            <section id="privacy" className="doc-section">
              <h2><span className="doc-icon">🛡️</span> Privacy Standards & System Limits</h2>
              <p>
                As an application under <strong>Bestdio</strong>, TeleCloud adheres to strict transparency standards regarding what the system can and cannot do:
              </p>
              <ul className="doc-list-styled">
                <li>
                  <strong>Zero Shared Pools:</strong> Each user's files live exclusively in the channel they connected. There is no shared database storage pool between accounts.
                </li>
                <li>
                  <strong>AES-256 At-Rest Encryption:</strong> Storage bot tokens are encrypted at rest with <code>ENCRYPTION_KEY</code> using AES-256-GCM, decrypted only in memory per request.
                </li>
                <li>
                  <strong>Self-Host Authority:</strong> Whoever controls the server and its <code>ENCRYPTION_KEY</code> can, in principle, decrypt stored tokens. Self-hosting TeleCloud removes this trust requirement entirely.
                </li>
                <li>
                  <strong>18MB Streaming Slices:</strong> Telegram bots can download files up to 20MB per message. TeleCloud automatically chunks uploads into 18MB parts to ensure seamless compatibility.
                </li>
                <li>
                  <strong>Memory Buffering Note:</strong> The demo backend buffers uploads in memory before chunking. For production deployments handling multi-gigabyte files simultaneously, ensure your server has adequate RAM or swap in a streaming disk buffer.
                </li>
                <li>
                  <strong>Permanent Deletion:</strong> Deleting a file through TeleCloud removes the underlying Telegram messages permanently. There is no recycle bin.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
