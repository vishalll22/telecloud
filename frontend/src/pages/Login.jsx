import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  loginWithTelegram,
  signupWithEmail,
  loginWithEmail,
  loginWithStorage,
  forgotPassword,
  resetPassword,
} from '../api.js';

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_AUTH_BOT_USERNAME || 'YourBotUsername';

export default function Login() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'bot' | 'telegram' | 'forgot'
  const [emailSubTab, setEmailSubTab] = useState('signin'); // 'signin' | 'signup'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Email Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Email Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Channel Bot ID Login State
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [showBotHelp, setShowBotHelp] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: enter code + new password
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [demoRecoveryCode, setDemoRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const widgetRef = useRef(null);

  useEffect(() => {
    if (activeTab !== 'telegram' || BOT_USERNAME === 'YourBotUsername') return;

    window.onTelegramAuth = async (telegramUser) => {
      try {
        await loginWithTelegram(telegramUser);
        navigate('/app');
      } catch (err) {
        setError(err.message);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
      widgetRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [activeTab, navigate]);

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await loginWithEmail({ email: signInEmail, password: signInPassword });
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await signupWithEmail({
        email: signUpEmail,
        password: signUpPassword,
        firstName: signUpName,
      });
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleBotLogin(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await loginWithStorage({
        botToken: botToken.trim(),
        channelId: channelId.trim(),
      });
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestCode(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setDemoRecoveryCode(res.demoCode || '');
      setSuccess(res.message);
      setForgotStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      const res = await resetPassword({
        email: forgotEmail,
        code: recoveryCodeInput,
        newPassword,
      });
      setSuccess(res.message);
      setTimeout(() => {
        setActiveTab('email');
        setEmailSubTab('signin');
        setSignInEmail(forgotEmail);
        setForgotStep(1);
        setSuccess('Password updated! Please sign in with your new password.');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell" style={{ maxWidth: 520, margin: '40px auto', padding: '0 20px' }}>
      <div className="nav-logo" style={{ fontSize: 26, textAlign: 'center', marginBottom: 8 }}>
        ☁️ TeleCloud
      </div>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: 14, marginBottom: 24 }}>
        Unlimited private cloud drive powered by your personal Telegram storage.
      </p>

      {/* Main Login Method Selector */}
      {activeTab !== 'forgot' && (
        <div className="auth-tabs" style={tabsStyle}>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => { setActiveTab('email'); setError(''); setSuccess(''); }}
            style={tabButtonStyle(activeTab === 'email')}
          >
            ✉️ Email Address
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'bot' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bot'); setError(''); setSuccess(''); }}
            style={tabButtonStyle(activeTab === 'bot')}
          >
            🤖 Channel Bot ID
          </button>
          {BOT_USERNAME !== 'YourBotUsername' && (
            <button
              type="button"
              className={`auth-tab ${activeTab === 'telegram' ? 'active' : ''}`}
              onClick={() => { setActiveTab('telegram'); setError(''); setSuccess(''); }}
              style={tabButtonStyle(activeTab === 'telegram')}
            >
              💬 Telegram
            </button>
          )}
        </div>
      )}

      {error && <div style={errorBannerStyle}>⚠️ {error}</div>}
      {success && <div style={successBannerStyle}>✨ {success}</div>}

      {/* TAB 1: EMAIL ADDRESS (SIGN IN / SIGN UP) */}
      {activeTab === 'email' && (
        <div className="auth-form-card" style={formStyle}>
          {/* Sub Tab Switcher */}
          <div className="auth-sub-tabs" style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 4 }}>
            <button
              type="button"
              onClick={() => { setEmailSubTab('signin'); setError(''); setSuccess(''); }}
              style={subTabStyle(emailSubTab === 'signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setEmailSubTab('signup'); setError(''); setSuccess(''); }}
              style={subTabStyle(emailSubTab === 'signup')}
            >
              Create New Account
            </button>
          </div>

          {emailSubTab === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>Password</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setError(''); setSuccess(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--signal)', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    style={{ ...inputStyle, width: '100%', paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    style={eyeButtonStyle}
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 8, padding: '12px', fontSize: 15, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>
                {busy ? 'Signing in…' : 'Sign In to Drive'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  placeholder="Alex Rivera"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="input-group">
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <div className="input-group">
                <label style={labelStyle}>Create Password (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ ...inputStyle, width: '100%', paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    style={eyeButtonStyle}
                    title={showSignUpPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignUpPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 8, padding: '12px', fontSize: 15, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1 }}>
                {busy ? 'Creating Account…' : 'Create Account & Access Drive'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: CHANNEL BOT ID ACCESS */}
      {activeTab === 'bot' && (
        <form className="auth-form-card" onSubmit={handleBotLogin} style={formStyle}>
          <div className="bot-login-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
              🔑 Direct Storage Login
            </span>
            <button
              type="button"
              onClick={() => setShowBotHelp(!showBotHelp)}
              style={{ background: 'none', border: 'none', color: 'var(--signal)', fontSize: 12, cursor: 'pointer' }}
            >
              {showBotHelp ? 'Hide Instructions ▲' : 'Where to get these? ▼'}
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Log in directly with your Telegram Bot Token and private Channel ID. No email address required!
          </p>

          {showBotHelp && (
            <div style={{ background: 'rgba(0,0,0,0.35)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', marginTop: 14, marginBottom: 14, textAlign: 'left', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div>
                  <strong style={{ color: 'var(--accent)', display: 'block', fontSize: 13.5, marginBottom: 4 }}>Step 1: Get Your Bot Token</strong>
                  1. Open Telegram and search for <strong>@BotFather</strong>.<br />
                  2. Send <code>/newbot</code>, give your bot a name and a username ending in <code>bot</code>.<br />
                  3. Copy the HTTP API Token (e.g. <code>123456789:ABC-DEF1234...</code>).
                </div>

                <div>
                  <strong style={{ color: 'var(--accent)', display: 'block', fontSize: 13.5, marginBottom: 4 }}>Step 2: Create Private Channel & Add Bot</strong>
                  1. Create a new <strong>Private Channel</strong> in Telegram.<br />
                  2. Go to Channel Settings → <strong>Administrators</strong> → Add your bot as an Admin with post permission.
                </div>

                <div>
                  <strong style={{ color: 'var(--accent)', display: 'block', fontSize: 13.5, marginBottom: 6 }}>Step 3: Get Your Channel ID (Which of the 3 IDs is Correct?)</strong>
                  Forward any message from your channel to <strong>@RawDataBot</strong>. Bots return <strong>3 different ID types</strong>. Use the correct one:
                  
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: 15 }}>✓</span>
                      <div>
                        <strong style={{ color: '#fff' }}>1. ID with `-100` Prefix (CORRECT)</strong><br />
                        Example: <code>-1001234567890</code><br />
                        <span style={{ fontSize: 12 }}>Telegram API strictly requires all private channel IDs to start with <code>-100</code> followed by the 10 or 13 digits. <strong>Always paste this ID!</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                      <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: 15 }}>✕</span>
                      <div>
                        <strong style={{ color: '#fff' }}>2. Short Numeric ID (DO NOT USE)</strong><br />
                        Example: <code>1234567890</code><br />
                        <span style={{ fontSize: 12 }}>Without the <code>-100</code> prefix, the API rejects it as "chat not found".</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8 }}>
                      <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: 15 }}>✕</span>
                      <div>
                        <strong style={{ color: '#fff' }}>3. Invite Link / Username (DO NOT USE)</strong><br />
                        Example: <code>https://t.me/+AbCdEfGhI</code> or <code>@MyChannel</code><br />
                        <span style={{ fontSize: 12 }}>URLs and invite links cannot be used for bot API storage calls.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label style={labelStyle}>Telegram Bot Token</label>
            <input
              type="text"
              placeholder="123456789:AAH...your_bot_token"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              required
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 13 }}
            />
          </div>

          <div className="input-group">
            <label style={labelStyle}>Telegram Channel ID</label>
            <input
              type="text"
              placeholder="-1001234567890"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              required
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: 13 }}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 8, padding: '12px', fontSize: 15 }}>
            {busy ? 'Verifying & Connecting…' : 'Log In with Channel Bot ID'}
          </button>
        </form>
      )}

      {/* TAB 3: TELEGRAM WIDGET */}
      {activeTab === 'telegram' && BOT_USERNAME !== 'YourBotUsername' && (
        <div className="auth-form-card" style={{ ...formStyle, textAlign: 'center', padding: '32px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
            Log in securely via the official Telegram account verification widget.
          </p>
          <div ref={widgetRef} style={{ display: 'flex', justifyContent: 'center' }} />
        </div>
      )}

      {/* FORGOT PASSWORD VIEW */}
      {activeTab === 'forgot' && (
        <div className="auth-form-card" style={formStyle}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: 0, color: 'var(--text)' }}>
            🔑 Reset Account Password
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 16px', lineHeight: 1.5 }}>
            {forgotStep === 1
              ? 'Enter your account email address below and we will generate a secure recovery code.'
              : 'Enter the recovery code below along with your new password.'}
          </p>

          {forgotStep === 1 ? (
            <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label style={labelStyle}>Account Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ padding: '12px' }}>
                {busy ? 'Generating Code…' : 'Send Recovery Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {demoRecoveryCode && (
                <div style={demoCodeBannerStyle}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>📨 Recovery Code Generated!</div>
                  <div style={{ fontSize: 13 }}>
                    For demo testing, your 6-digit code is:{' '}
                    <strong style={{ fontSize: 16, color: '#fff', letterSpacing: 2 }}>{demoRecoveryCode}</strong>
                  </div>
                </div>
              )}
              <div className="input-group">
                <label style={labelStyle}>6-Digit Recovery Code</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={recoveryCodeInput}
                  onChange={(e) => setRecoveryCodeInput(e.target.value)}
                  required
                  style={{ ...inputStyle, letterSpacing: 3, fontWeight: 600 }}
                />
              </div>
              <div className="input-group">
                <label style={labelStyle}>New Password (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ ...inputStyle, width: '100%', paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={eyeButtonStyle}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ padding: '12px' }}>
                {busy ? 'Updating Password…' : 'Set New Password & Sign In'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setEmailSubTab('signin'); setForgotStep(1); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          ← Return to TeleCloud Home
        </Link>
      </div>
    </div>
  );
}

// Inline Styles for Clean Architecture
const tabsStyle = {
  display: 'flex',
  background: 'var(--bg-raised)',
  borderRadius: 12,
  padding: 4,
  marginBottom: 20,
  border: '1px solid var(--border)',
};

const tabButtonStyle = (active) => ({
  flex: 1,
  background: active ? 'var(--signal)' : 'transparent',
  color: active ? '#000' : 'var(--text-muted)',
  border: 'none',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const subTabStyle = (active) => ({
  background: active ? 'var(--accent-soft)' : 'transparent',
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  border: active ? '1px solid rgba(76, 125, 255, 0.3)' : '1px solid transparent',
  borderRadius: 8,
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  background: 'rgba(255, 255, 255, 0.02)',
  padding: 24,
  borderRadius: 16,
  border: '1px solid var(--border)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'block',
};

const inputStyle = {
  background: 'var(--bg-raised)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const eyeButtonStyle = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  padding: 4,
  color: 'var(--text-muted)',
};

const setupStepsStyle = {
  background: 'rgba(0, 0, 0, 0.3)',
  padding: 12,
  borderRadius: 8,
  color: 'var(--text-muted)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};

const errorBannerStyle = {
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid var(--danger)',
  color: 'var(--danger)',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 13,
  marginBottom: 16,
  textAlign: 'center',
};

const successBannerStyle = {
  background: 'rgba(34, 197, 94, 0.1)',
  border: '1px solid var(--success)',
  color: 'var(--success)',
  padding: '10px 14px',
  borderRadius: 10,
  fontSize: 13,
  marginBottom: 16,
  textAlign: 'center',
};

const demoCodeBannerStyle = {
  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15))',
  border: '1px solid var(--signal)',
  color: 'var(--signal)',
  padding: '14px',
  borderRadius: 10,
  textAlign: 'center',
};

