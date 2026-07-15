import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="footer-glow" aria-hidden="true" />
      
      <div className="container footer-content">
        {/* Bestdio Ecosystem Banner */}
        <div className="bestdio-banner-card">
          <div className="bestdio-banner-content">
            <div className="bestdio-badge">
              <span className="bestdio-sparkle">✨</span>
              <span>An App under Bestdio</span>
            </div>
            <h3 className="bestdio-title">Built with state-of-the-art cloud architecture by Bestdio.</h3>
            <p className="bestdio-desc">
              TeleCloud is part of the Bestdio ecosystem — pioneering privacy-first, unlimited decentralized web tools that put users back in complete control of their data.
            </p>
          </div>
          <div className="bestdio-banner-action">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-bestdio-explore"
            >
              <span>Explore Bestdio Ecosystem</span>
              <span className="arrow">↗</span>
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">☁️</span>
              <span className="logo-text">Tele<span className="logo-highlight">Cloud</span></span>
            </Link>
            <p className="footer-tagline">
              Turn your personal Telegram account into unlimited, AES-256 encrypted cloud storage. No subscription ceilings, zero monthly fees.
            </p>
            <div className="footer-status">
              <span className="status-dot"></span>
              <span className="status-text">All Systems Operational</span>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Product</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/docs">Documentation</Link></li>
              <li><Link to="/docs#install">Install PWA App</Link></li>
              <li><Link to="/docs#how-it-works">Architecture</Link></li>
              <li><Link to="/login">Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Legal & Privacy</h4>
            <ul>
              <li><Link to="/legal">Legal Hub</Link></li>
              <li><Link to="/legal#terms">Terms of Service</Link></li>
              <li><Link to="/legal#privacy">Privacy Policy</Link></li>
              <li><Link to="/legal#aup">Acceptable Use Policy</Link></li>
              <li><Link to="/legal#security">Security & Encryption</Link></li>
              <li><Link to="/legal#cookies">Cookie Policy</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Ecosystem</h4>
            <ul>
              <li>
                <a href="#bestdio" className="footer-bestdio-link">
                  <span className="badge-micro">PRO</span>
                  Bestdio Apps
                </a>
              </li>
              <li><a href="https://telegram.org" target="_blank" rel="noopener noreferrer">Telegram API ↗</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">Self-Host Guide ↗</a></li>
              <li><a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather ↗</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} TeleCloud — <strong className="bestdio-highlight">An app under Bestdio</strong>. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <Link to="/legal#privacy">Privacy</Link>
            <span className="separator">•</span>
            <Link to="/legal#terms">Terms</Link>
            <span className="separator">•</span>
            <Link to="/legal#cookies">Cookies</Link>
            <span className="separator">•</span>
            <a href="#top" className="back-to-top">↑ Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
