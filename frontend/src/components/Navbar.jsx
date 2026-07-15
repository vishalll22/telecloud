import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { currentUser } from '../api.js';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setUser(currentUser());
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <div className="logo-icon">☁️</div>
          <span className="logo-text">Tele<span className="logo-highlight">Cloud</span></span>
          <span className="logo-badge">PRO</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links desktop-only">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/docs" 
            className={`nav-link ${location.pathname === '/docs' ? 'active' : ''}`}
          >
            Documentation
          </Link>
          <Link 
            to="/legal" 
            className={`nav-link ${location.pathname === '/legal' ? 'active' : ''}`}
          >
            Legal & Privacy
          </Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-link nav-external"
          >
            <span>Self-Host</span>
            <span className="external-icon">↗</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="nav-actions desktop-only">
          {user ? (
            <Link to="/app" className="btn btn-primary btn-glow">
              <span>Go to Dashboard</span>
              <span className="btn-arrow">→</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/login" className="btn btn-primary btn-glow">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open-1' : ''}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? 'open-2' : ''}`} />
          <span className={`hamburger-line ${mobileMenuOpen ? 'open-3' : ''}`} />
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-links">
            <Link to="/" className={`mobile-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>
              🏠 Home
            </Link>
            <Link to="/docs" className={`mobile-link ${location.pathname === '/docs' ? 'active' : ''}`} onClick={closeMenu}>
              📖 Documentation
            </Link>
            <Link to="/legal" className={`mobile-link ${location.pathname === '/legal' ? 'active' : ''}`} onClick={closeMenu}>
              ⚖️ Legal & Privacy
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="mobile-link" onClick={closeMenu}>
              💻 Self-Host Guide ↗
            </a>
          </div>
          <div className="mobile-actions">
            {user ? (
              <Link to="/app" className="btn btn-primary btn-block" onClick={closeMenu}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-block" onClick={closeMenu}>Log in</Link>
                <Link to="/login" className="btn btn-primary btn-block" onClick={closeMenu}>Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
