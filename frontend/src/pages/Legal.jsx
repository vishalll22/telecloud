import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const legalTabs = [
  { id: 'terms', label: 'Terms of Service', icon: '📜', summary: 'Usage rules, account eligibility, and service limitations.' },
  { id: 'privacy', label: 'Privacy Policy', icon: '🔒', summary: 'How your Telegram identity is verified and why files stay 100% private.' },
  { id: 'aup', label: 'Acceptable Use Policy', icon: '🚫', summary: 'Prohibited actions, copyright compliance, and API abuse prevention.' },
  { id: 'security', label: 'Security & Encryption', icon: '🛡️', summary: 'AES-256 token encryption, 18MB streaming chunking, and isolation.' },
  { id: 'cookies', label: 'Cookie & Local Storage Policy', icon: '🍪', summary: 'Zero advertising trackers, zero third-party cookies, pure local storage.' },
];

export default function Legal() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    if (location.hash) {
      const hashId = location.hash.replace('#', '');
      if (legalTabs.some(t => t.id === hashId)) {
        setActiveTab(hashId);
        const el = document.getElementById(hashId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="legal-shell container">
        <div className="legal-header">
          <div className="eyebrow"><span className="signal-pulse"></span> LEGAL & COMPLIANCE HUB</div>
          <h1>Transparency, Privacy, and User Ownership.</h1>
          <p className="lead">
            TeleCloud is built from the ground up as an application under Bestdio with a radical privacy philosophy:
            we do not want your data, we do not store your files, and we cannot read your cloud drive.
          </p>
        </div>

        <div className="legal-layout">
          {/* Sticky Navigation Sidebar */}
          <aside className="legal-sidebar">
            <div className="sidebar-title">COMPLIANCE DOCUMENTS</div>
            <nav className="legal-nav">
              {legalTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.history.pushState(null, '', `#${tab.id}`);
                  }}
                  className={`legal-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <div className="tab-text">
                    <span className="tab-label">{tab.label}</span>
                  </div>
                  <span className="tab-arrow">→</span>
                </button>
              ))}
            </nav>

            <div className="sidebar-help-card">
              <h4>Need Legal Assistance?</h4>
              <p>For DMCA notices, self-hosting compliance queries, or security reports, reach out to our team.</p>
              <a href="mailto:legal@bestdio.com" className="btn btn-ghost btn-sm btn-block">
                ✉️ legal@bestdio.com
              </a>
            </div>
          </aside>

          {/* Content Area */}
          <div className="legal-content-card">
            {activeTab === 'terms' && (
              <section id="terms" className="legal-section animate-fade-in">
                <div className="section-badge">LAST UPDATED: JULY 2026</div>
                <h2>Terms of Service</h2>
                <p>
                  Welcome to TeleCloud, an application developed and operated under <strong>Bestdio</strong> ("we", "us", or "our"). 
                  By accessing or using TeleCloud, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                </p>

                <h3>1. Architecture & Service Scope</h3>
                <p>
                  TeleCloud provides a software interface that connects a user's Telegram account to their own private Telegram channel for file storage. 
                  Unlike traditional cloud providers, TeleCloud does not host a centralized storage infrastructure for user files. Your files reside exclusively on servers operated by Telegram Messenger Inc., within a private channel created and controlled by you.
                </p>

                <h3>2. User Responsibilities & Account Eligibility</h3>
                <ul>
                  <li><strong>Telegram Account Ownership:</strong> You must maintain an active, valid Telegram account in good standing with Telegram's Terms of Service.</li>
                  <li><strong>Bot & Channel Administration:</strong> You are solely responsible for creating your storage bot via @BotFather, securing your bot token, and managing the private channel where your data is stored.</li>
                  <li><strong>Credential Protection:</strong> While TeleCloud encrypts your bot token at rest, you must ensure your Telegram account is secured with Two-Factor Authentication (2FA).</li>
                </ul>

                <h3>3. No Warranty & Limitation of Liability</h3>
                <p>
                  TeleCloud is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without any warranties of any kind. 
                  Because TeleCloud relies on third-party APIs provided by Telegram, we are not responsible for:
                </p>
                <ul>
                  <li>Any changes to Telegram's API rate limits, file size restrictions, or Terms of Service.</li>
                  <li>Loss of access to your files resulting from the deletion of your Telegram account, channel, or storage bot.</li>
                  <li>Any temporary service interruptions during upload or download streaming.</li>
                </ul>

                <h3>4. Account Termination & Revocation</h3>
                <p>
                  You may terminate your use of TeleCloud at any time by disconnecting your storage credentials from the dashboard or by regenerating/deleting your bot token in Telegram's @BotFather. Upon token regeneration, TeleCloud immediately loses all technical capability to interact with your channel.
                </p>
              </section>
            )}

            {activeTab === 'privacy' && (
              <section id="privacy" className="legal-section animate-fade-in">
                <div className="section-badge">ZERO-KNOWLEDGE STORAGE</div>
                <h2>Privacy Policy</h2>
                <p>
                  At TeleCloud, privacy is not an afterthought — it is our core architectural premise. As part of the <strong>Bestdio</strong> ecosystem, we engineer systems where third-party data collection is technically impossible rather than merely forbidden by policy.
                </p>

                <div className="highlight-callout">
                  <div className="callout-icon">🔐</div>
                  <div>
                    <strong>The Golden Rule of TeleCloud:</strong>
                    <p>We never have access to your personal Telegram messages, contacts, or chats. The login widget only confirms your identity, and your storage bot only has access to the dedicated private channel you assign to it.</p>
                  </div>
                </div>

                <h3>1. Two-Bot Architecture & Permission Isolation</h3>
                <p>To ensure maximum security, TeleCloud strictly separates identity verification from storage management:</p>
                <ul>
                  <li><strong>The Login Bot (Identity Only):</strong> Used exclusively during the Telegram Login Widget authentication. It receives only your public Telegram display name, username, and ID. It has zero access to your chats or media.</li>
                  <li><strong>Your Storage Bot (Storage Only):</strong> A dedicated bot created by you. It operates strictly within the isolated private channel you specify. No other user on TeleCloud can see, query, or download from your channel.</li>
                </ul>

                <h3>2. How We Secure Your Credentials</h3>
                <p>
                  When you connect your storage bot token and channel ID, the TeleCloud server immediately encrypts the token using **AES-256-GCM encryption** with a secret server key (`ENCRYPTION_KEY`) before saving it to the database. Tokens are never stored in plain text and are only decrypted temporarily in server memory when actively processing a file upload or download request initiated by you.
                </p>

                <h3>3. Data Retention & Deletion</h3>
                <p>
                  When you delete a file through the TeleCloud file manager interface, the application sends a direct API command to Telegram to permanently delete the underlying message chunks from your channel. There is no recycle bin on TeleCloud or our servers. Once deleted, files cannot be recovered.
                </p>

                <h3>4. Your Rights Under GDPR & CCPA</h3>
                <p>
                  Because we store minimal metadata (only your Telegram ID and encrypted bot token), exercising your privacy rights is instantaneous:
                </p>
                <ul>
                  <li><strong>Right to Erasure (Right to be Forgotten):</strong> Clicking "Disconnect Storage" in your dashboard permanently erases your encrypted credentials from our database.</li>
                  <li><strong>Right to Portability:</strong> Your files are stored as standard document attachments in your Telegram channel; you can access and download them directly via any standard Telegram client at any time without needing TeleCloud.</li>
                </ul>
              </section>
            )}

            {activeTab === 'aup' && (
              <section id="aup" className="legal-section animate-fade-in">
                <div className="section-badge">COMMUNITY STANDARDS</div>
                <h2>Acceptable Use Policy (AUP)</h2>
                <p>
                  This Acceptable Use Policy defines acceptable practices for using TeleCloud and any services provided under the <strong>Bestdio</strong> brand. By using TeleCloud, you agree to comply with all rules outlined below.
                </p>

                <h3>1. Compliance with Telegram Terms</h3>
                <p>
                  Because your files are hosted within Telegram's infrastructure, your use of TeleCloud must strictly adhere to <a href="https://telegram.org/tos" target="_blank" rel="noopener noreferrer">Telegram's Terms of Service</a>. You may not use TeleCloud to circumvent Telegram's enforcement mechanisms or terms.
                </p>

                <h3>2. Prohibited Activities & Content</h3>
                <p>You are strictly prohibited from using TeleCloud to upload, store, stream, or share:</p>
                <ul>
                  <li><strong>Copyright Infringement:</strong> Pirated software, unauthorized movies, music, or copyrighted works without explicit authorization from the rightsholder (DMCA violations).</li>
                  <li><strong>Malware & Cyberattack Tools:</strong> Viruses, ransomware, trojans, phishing kits, or automated botnet command-and-control payloads.</li>
                  <li><strong>Illegal & Harmful Content:</strong> Any material violating international law, including child sexual abuse material (CSAM), terrorism promotion, or harassment.</li>
                  <li><strong>API Abuse:</strong> Automated scripts designed to overwhelm Telegram's API rate limits or denial-of-service attacks against TeleCloud infrastructure.</li>
                </ul>

                <h3>3. Enforcement & DMCA Takedowns</h3>
                <p>
                  While TeleCloud does not monitor or inspect private user channels (as we lack decryption rights to inspect content), any verified report of legal violations or API abuse will result in immediate suspension of the user's TeleCloud dashboard access and potential reporting to Telegram authorities.
                </p>
              </section>
            )}

            {activeTab === 'security' && (
              <section id="security" className="legal-section animate-fade-in">
                <div className="section-badge">TECHNICAL SPECIFICATION</div>
                <h2>Security & Encryption Architecture</h2>
                <p>
                  TeleCloud combines modern web encryption standards with Telegram's robust cloud infrastructure. Here is an exhaustive technical breakdown of how we keep your cloud drive secure.
                </p>

                <div className="security-grid">
                  <div className="security-card">
                    <h4>🔒 AES-256 At-Rest Encryption</h4>
                    <p>All bot tokens stored in our backend are encrypted using AES-256 encryption. The encryption key resides exclusively in server environment variables and never touches public databases or client bundles.</p>
                  </div>
                  <div className="security-card">
                    <h4>⚡ 18MB Streaming Chunking</h4>
                    <p>To overcome Telegram's 20MB bot upload limitation, TeleCloud automatically slices large files into 18MB encrypted chunks during upload, reconstructing them seamlessly on download.</p>
                  </div>
                  <div className="security-card">
                    <h4>🛡️ Zero Shared Storage Pools</h4>
                    <p>Every account is isolated in a 1:1 relationship with its own private Telegram channel. There is no multi-tenant database table storing your files alongside other users.</p>
                  </div>
                  <div className="security-card">
                    <h4>🏠 Self-Hosting Transparency</h4>
                    <p>Don't want to trust any third-party server? TeleCloud is fully open-source. You can inspect every line of code and host the backend on your own Raspberry Pi or VPS in minutes.</p>
                  </div>
                </div>

                <h3>1. In-Transit Encryption</h3>
                <p>
                  All communication between your browser and TeleCloud servers occurs over TLS 1.3 encrypted HTTPS connections. When TeleCloud communicates with Telegram's servers on your behalf, it utilizes Telegram's official HTTPS Bot API endpoints.
                </p>

                <h3>2. Memory Decryption Lifecycle</h3>
                <p>
                  When you request a file listing or initiate an upload, your encrypted bot token is fetched from the database and decrypted strictly within the temporary execution context of the Node.js Express request handler. Once the Telegram API request completes, the decrypted token is immediately garbage-collected from RAM.
                </p>
              </section>
            )}

            {activeTab === 'cookies' && (
              <section id="cookies" className="legal-section animate-fade-in">
                <div className="section-badge">NO TRACKERS</div>
                <h2>Cookie & Local Storage Policy</h2>
                <p>
                  In alignment with <strong>Bestdio's</strong> commitment to user privacy, TeleCloud operates with a zero-tracking policy. We do not use third-party advertising cookies, analytics pixels, or cross-site tracking scripts.
                </p>

                <h3>1. How We Use Browser Storage</h3>
                <p>
                  TeleCloud relies exclusively on HTML5 Local Storage and minimal functional cookies to maintain your authentication session and UI preferences:
                </p>

                <div className="table-responsive">
                  <table className="docs-table">
                    <thead>
                      <tr>
                        <th>Storage Key</th>
                        <th>Type</th>
                        <th>Purpose</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>telecloud_token</code></td>
                        <td>Local Storage</td>
                        <td>Stores your cryptographic JSON Web Token (JWT) issued upon Telegram verification so you stay logged in.</td>
                        <td>Until logout</td>
                      </tr>
                      <tr>
                        <td><code>telecloud_theme</code></td>
                        <td>Local Storage</td>
                        <td>Remembers your preferred UI aesthetic (dark/glassmorphism mode).</td>
                        <td>Persistent</td>
                      </tr>
                      <tr>
                        <td><code>telecloud_connected</code></td>
                        <td>Local Storage</td>
                        <td>Cache flag indicating whether your storage bot is connected, speeding up dashboard load times.</td>
                        <td>Session</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3>2. Third-Party Services</h3>
                <p>
                  The only third-party script executed on TeleCloud is the official **Telegram Login Widget** (`https://telegram.org/js/telegram-widget.js`), which is required to authenticate your account securely via Telegram's servers. Telegram may set its own authentication cookies when you interact with the widget.
                </p>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
