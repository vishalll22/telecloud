import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const demoFiles = [
  { name: 'quarterly-backup-2026.zip', size: '14.2 GB', type: 'ZIP', time: 'Just now' },
  { name: 'cinematic-drone-4k.mov', size: '3.8 GB', type: 'MOV', time: '2 mins ago' },
  { name: 'design-system-v4.psd', size: '840 MB', type: 'PSD', time: '1 hour ago' },
  { name: 'database-dump-prod.sql', size: '1.2 GB', type: 'SQL', time: 'Yesterday' },
];

const faqs = [
  {
    q: "Is TeleCloud really unlimited cloud storage?",
    a: "Yes! Telegram channels have zero storage limits or quotas. Because TeleCloud uploads your files into a private Telegram channel that only you own, you can store terabytes of data without ever hitting a subscription ceiling or upgrading your plan."
  },
  {
    q: "How does TeleCloud bypass Telegram's 20MB bot file limit?",
    a: "Our automated streaming engine intelligently splits large files into encrypted 18MB chunks during upload. When you download a file or stream a video, TeleCloud reconstructs the parts seamlessly in real time—giving you a normal file manager experience."
  },
  {
    q: "Can anyone at Bestdio or TeleCloud see my files?",
    a: "No! Absolutely not. We use a Two-Bot Architecture. Our login bot only verifies your identity via Telegram's official widget. Your storage bot is created by you in @BotFather and connects only to your private channel. We never have access to your personal chats or media."
  },
  {
    q: "What does it mean that TeleCloud is 'An app under Bestdio'?",
    a: "Bestdio is an engineering collective dedicated to building modern, privacy-first cloud tools and decentralized software. As an app under Bestdio, TeleCloud benefits from state-of-the-art security practices, open-source transparency, and zero advertising trackers."
  },
  {
    q: "Can I install TeleCloud on my phone or laptop?",
    a: "Yes! TeleCloud is a Progressive Web App (PWA). Once logged in, simply click 'Install App' in your browser or dashboard header. It installs natively on Windows, macOS, iOS, and Android—opening directly into your files without a browser address bar."
  },
  {
    q: "What happens if I delete a file in TeleCloud?",
    a: "Deleting a file via our interface permanently deletes the underlying message chunks from your Telegram channel. There is no recycle bin on our servers, ensuring total cleanup when you remove sensitive data."
  }
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState('creators');

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero Section */}
      <header className="hero-section container">
        <div className="hero-bg-glow" aria-hidden="true" />
        
        <div className="hero-content">
          <div className="eyebrow-badge">
            <span className="signal-dot"></span>
            <span>POWERED BY YOUR TELEGRAM ACCOUNT • BY BESTDIO</span>
          </div>
          <h1>Your Telegram Account, Turned Into <span className="gradient-text">Unlimited Private Storage.</span></h1>
          <p className="lead">
            TeleCloud streams your files into a private Telegram channel only you control, giving you a lightning-fast, sleek file manager on top.
            Zero monthly subscription fees. No storage tiers to outgrow.
          </p>
          
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg btn-glow">
              <span>Get Started Free</span>
              <span className="arrow">→</span>
            </Link>
            <Link to="/docs" className="btn btn-ghost btn-lg">
              <span>Read Architecture Docs</span>
            </Link>
          </div>

          <div className="hero-trust-bar">
            <div className="trust-item">🔒 AES-256 Encrypted</div>
            <div className="trust-item">⚡ 100% Free & Unlimited</div>
            <div className="trust-item">📱 PWA Native Install</div>
            <div className="trust-item">✨ Bestdio Ecosystem</div>
          </div>
        </div>

        {/* Dynamic Interactive Thread Visual */}
        <div className="hero-visual">
          <div className="thread-card">
            <div className="thread-header">
              <div className="channel-info">
                <span className="channel-icon">🔐</span>
                <div>
                  <div className="channel-name">My Private Cloud Drive</div>
                  <div className="channel-sub">2,410 chunks • 20.2 GB stored</div>
                </div>
              </div>
              <div className="channel-badge">PRIVATE CHANNEL</div>
            </div>

            <div className="thread-body">
              {demoFiles.map((f, i) => (
                <div className="bubble" key={f.name} style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className={`file-type-icon icon-${f.type.toLowerCase()}`}>
                    {f.type}
                  </div>
                  <div className="meta">
                    <div className="filename">{f.name}</div>
                    <div className="filedetails">
                      <span className="filesize">{f.size}</span>
                      <span className="filetime">• {f.time}</span>
                    </div>
                  </div>
                  <div className="status-pill">
                    <span className="tick">✓</span> Stored
                  </div>
                </div>
              ))}
            </div>

            <div className="thread-footer">
              <div className="upload-sim">
                <span className="pulse-circle"></span>
                <span>Streaming chunk #18 of project-archive.tar.gz...</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Comparison Section */}
      <section className="comparison-section container">
        <div className="section-header text-center">
          <div className="eyebrow">WHY SETTLE FOR LESS?</div>
          <h2>Traditional Cloud vs. <span className="gradient-text">TeleCloud</span></h2>
          <p className="section-sub">Stop paying $20/month for cloud storage when you already own the world's most robust messaging network.</p>
        </div>

        <div className="table-card">
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature / Metric</th>
                  <th className="highlight-col">☁️ TeleCloud <span className="bestdio-tag">by Bestdio</span></th>
                  <th>Google Drive</th>
                  <th>Dropbox</th>
                  <th>iCloud</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Storage Ceiling</strong></td>
                  <td className="highlight-col"><strong className="text-success">♾️ Unlimited</strong></td>
                  <td>15 GB free / $10/mo for 2TB</td>
                  <td>2 GB free / $12/mo for 2TB</td>
                  <td>5 GB free / $10/mo for 2TB</td>
                </tr>
                <tr>
                  <td><strong>Monthly Subscription Fee</strong></td>
                  <td className="highlight-col"><strong className="text-success">$0 / Forever Free</strong></td>
                  <td>Recurring monthly fee</td>
                  <td>Recurring monthly fee</td>
                  <td>Recurring monthly fee</td>
                </tr>
                <tr>
                  <td><strong>Data Privacy & Isolation</strong></td>
                  <td className="highlight-col"><strong>100% Private Channel</strong> (Only your bot)</td>
                  <td>Scanned for AI & ads</td>
                  <td>Centralized server pool</td>
                  <td>Centralized server pool</td>
                </tr>
                <tr>
                  <td><strong>Max File Size</strong></td>
                  <td className="highlight-col"><strong>Unlimited</strong> (Auto 18MB chunking)</td>
                  <td>5 TB</td>
                  <td>2 TB / 50 GB transfers</td>
                  <td>50 GB</td>
                </tr>
                <tr>
                  <td><strong>Encryption at Rest</strong></td>
                  <td className="highlight-col"><strong>AES-256 Token Encryption</strong></td>
                  <td>Standard server-side</td>
                  <td>Standard server-side</td>
                  <td>Advanced Data Protection (opt-in)</td>
                </tr>
                <tr>
                  <td><strong>Self-Hostable</strong></td>
                  <td className="highlight-col"><strong className="text-success">✓ Yes (Open Source)</strong></td>
                  <td>✕ No</td>
                  <td>✕ No</td>
                  <td>✕ No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="usecases-section container">
        <div className="section-header text-center">
          <div className="eyebrow">BUILT FOR EVERYONE</div>
          <h2>How Will You Use <span className="gradient-text">Your Unlimited Cloud?</span></h2>
          <p className="section-sub">From 4K video archives to automated database backups, TeleCloud adapts to your exact workflow.</p>
        </div>

        <div className="usecase-tabs">
          <button 
            className={`usecase-tab-btn ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => setActiveTab('creators')}
          >
            🎨 For Creators & Media
          </button>
          <button 
            className={`usecase-tab-btn ${activeTab === 'devs' ? 'active' : ''}`}
            onClick={() => setActiveTab('devs')}
          >
            💻 For Developers
          </button>
          <button 
            className={`usecase-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🛡️ For Privacy Seekers
          </button>
          <button 
            className={`usecase-tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            ⚡ For Power Users
          </button>
        </div>

        <div className="usecase-content-card animate-fade-in">
          {activeTab === 'creators' && (
            <div className="usecase-pane">
              <div className="usecase-text">
                <h3>Store 4K RAW Footage & Project Files Without Limits</h3>
                <p>
                  Video editors, graphic designers, and 3D artists know the pain of filling up a 2TB hard drive mid-project.
                  With TeleCloud, drag and drop massive `.mov`, `.psd`, and `.blend` archives directly into your browser. 
                  Our background chunker handles multi-gigabyte uploads while you keep working.
                </p>
                <ul className="usecase-bullets">
                  <li>✓ Stream video previews instantly without downloading the whole file</li>
                  <li>✓ Keep client archives for years without paying storage overages</li>
                  <li>✓ Shareable links directly from your private channel</li>
                </ul>
              </div>
              <div className="usecase-visual">
                <div className="mock-preview-card">
                  <div className="mock-header">📁 /projects/client-shoot-2026/</div>
                  <div className="mock-row">🎬 B-Roll-CamA-001.mov <span className="badge-purple">4.8 GB</span></div>
                  <div className="mock-row">🎬 B-Roll-CamB-002.mov <span className="badge-purple">5.1 GB</span></div>
                  <div className="mock-row">🎨 Color-Grade-LUTs.zip <span className="badge-blue">120 MB</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devs' && (
            <div className="usecase-pane">
              <div className="usecase-text">
                <h3>Automated Database Backups & Log Archiving</h3>
                <p>
                  Why pay AWS S3 or DigitalOcean Spaces for cold storage backups? Connect your server's cron jobs directly to your TeleCloud storage bot.
                  Dump Postgres databases, Docker volumes, and server logs into your private Telegram channel for free, reliable, redundant offsite storage.
                </p>
                <ul className="usecase-bullets">
                  <li>✓ Simple REST API for scripted uploads and downloads</li>
                  <li>✓ 100% programmatic access via your personal bot token</li>
                  <li>✓ Never worry about S3 bandwidth egress fees again</li>
                </ul>
              </div>
              <div className="usecase-visual">
                <div className="mock-preview-card font-mono">
                  <div className="mock-header">💻 Terminal — Cron Execution</div>
                  <div className="mock-row text-success">$ pg_dump -U postgres prod_db | gzip &gt; dump.sql.gz</div>
                  <div className="mock-row">$ curl -X POST https://telecloud/api/files/upload ...</div>
                  <div className="mock-row text-accent">✓ Uploaded dump.sql.gz (1.4 GB in 78 chunks)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="usecase-pane">
              <div className="usecase-text">
                <h3>Your Keys, Your Channel, Zero Third-Party Scanning</h3>
                <p>
                  Major tech giants scan your personal cloud drive for advertising profiles and AI training data.
                  TeleCloud puts you back in the driver's seat. Because you create your own Telegram bot and private channel, no one else—including Bestdio engineers—can read your directory structure or access your files.
                </p>
                <ul className="usecase-bullets">
                  <li>✓ AES-256-GCM at-rest token encryption on our servers</li>
                  <li>✓ Zero third-party analytics or advertising cookies</li>
                  <li>✓ Revoke access anytime with one click in @BotFather</li>
                </ul>
              </div>
              <div className="usecase-visual">
                <div className="mock-preview-card">
                  <div className="mock-header">🛡️ Security Shield Status</div>
                  <div className="mock-row">🔐 Token Encryption: <strong className="text-success">AES-256 Active</strong></div>
                  <div className="mock-row">🚫 Third-Party Trackers: <strong className="text-success">0 Blocked</strong></div>
                  <div className="mock-row">👁️ Channel Access: <strong className="text-accent">Only You & @YourBot</strong></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="usecase-pane">
              <div className="usecase-text">
                <h3>Native App Experience on Laptop & Phone via PWA</h3>
                <p>
                  You don't need to open a bloated browser tab every time you want your files. TeleCloud installs natively as a Progressive Web App (PWA) on macOS, Windows, iOS, and Android.
                  Get a dedicated desktop icon, offline caching, and native drag-and-drop support that feels just like Finder or File Explorer.
                </p>
                <ul className="usecase-bullets">
                  <li>✓ One-click install from any modern web browser</li>
                  <li>✓ Skips the address bar and opens straight into your dashboard</li>
                  <li>✓ Fast, lightweight bundle engineered by Bestdio</li>
                </ul>
              </div>
              <div className="usecase-visual">
                <div className="mock-preview-card">
                  <div className="mock-header">📱 PWA App Installation</div>
                  <div className="mock-row">💻 macOS / Windows: <strong className="text-success">Installed</strong></div>
                  <div className="mock-row">📱 iOS / Android: <strong className="text-success">Home Screen Ready</strong></div>
                  <div className="mock-row">⚡ Startup Speed: <strong className="text-accent">&lt; 200ms Instant</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section container">
        <div className="section-header text-center">
          <div className="eyebrow">ENGINEERED FOR EXCELLENCE</div>
          <h2>Everything You Expect From a <span className="gradient-text">Modern Cloud Drive.</span></h2>
        </div>

        <div className="features-grid">
          <div className="feature-card-rich">
            <div className="icon-wrapper">⬢</div>
            <h3>No Storage Ceilings</h3>
            <p>Large files are automatically split into 18MB parts and streamed across your own private channel. There is literally no subscription tier to upgrade to.</p>
          </div>
          <div className="feature-card-rich">
            <div className="icon-wrapper">◆</div>
            <h3>Use Your Existing Account</h3>
            <p>Log in in seconds with the Telegram account you already own. No new passwords to remember, no credit card required, and no identity friction.</p>
          </div>
          <div className="feature-card-rich">
            <div className="icon-wrapper">▣</div>
            <h3>Installs Like a Real App</h3>
            <p>Add TeleCloud to your laptop or phone home screen as a standalone Progressive Web App. It opens straight into your files without browser chrome.</p>
          </div>
          <div className="feature-card-rich">
            <div className="icon-wrapper">🔒</div>
            <h3>AES-256 Token Encryption</h3>
            <p>Your storage bot token is encrypted at rest using industry-standard AES-256-GCM. It is only decrypted in memory during active file streaming.</p>
          </div>
          <div className="feature-card-rich">
            <div className="icon-wrapper">⚡</div>
            <h3>Lightning Fast Streaming</h3>
            <p>Download files or stream videos directly from Telegram's high-speed global CDN network with zero buffering or throttling.</p>
          </div>
          <div className="feature-card-rich">
            <div className="icon-wrapper">✨</div>
            <h3>An App Under Bestdio</h3>
            <p>Backed by the Bestdio ecosystem of privacy-first, open-source cloud utilities. Built with clean code and uncompromising user empowerment.</p>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="faq-section container">
        <div className="section-header text-center">
          <div className="eyebrow">GOT QUESTIONS?</div>
          <h2>Frequently Asked <span className="gradient-text">Questions.</span></h2>
          <p className="section-sub">Everything you need to know about TeleCloud, Telegram storage mechanics, and Bestdio.</p>
        </div>

        <div className="faq-accordion">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`faq-item ${openFaq === idx ? 'open' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                aria-expanded={openFaq === idx}
              >
                <span>{faq.q}</span>
                <span className="faq-toggle">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="faq-answer animate-fade-in">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* High-Converting CTA Banner */}
      <section className="cta-section container">
        <div className="cta-card">
          <div className="cta-glow" aria-hidden="true" />
          <div className="cta-content">
            <div className="cta-badge">🚀 READY TO BREAK FREE FROM STORAGE LIMITS?</div>
            <h2>Start Storing Unlimited Files in Less Than 2 Minutes.</h2>
            <p>
              Join thousands of users who have turned their Telegram accounts into encrypted, unlimited personal cloud drives.
              No credit cards, no subscriptions, 100% free forever.
            </p>
            <div className="cta-actions">
              <Link to="/login" className="btn btn-primary btn-lg btn-glow">
                <span>Connect Your Telegram Now</span>
                <span className="arrow">→</span>
              </Link>
              <Link to="/docs" className="btn btn-ghost btn-lg">
                <span>Explore Setup Docs</span>
              </Link>
            </div>
            <div className="cta-subtext">
              ✨ Proudly built and maintained as an app under <strong className="bestdio-highlight">Bestdio</strong>.
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
