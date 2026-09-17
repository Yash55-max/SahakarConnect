import React, { useState } from 'react';
import {
  EmblemIcon,
  ConsumerIcon,
  ProviderIcon,
  LockIcon,
  UsersIcon,
  CheckCircleIcon,
} from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
  initialMode?: 'signin' | 'register';
  initialRole?: 'consumer' | 'provider' | 'coop_admin' | 'regulator';
  lang?: 'en' | 'hi';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
  initialRole = 'consumer',
  lang = 'en',
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);

  // Sign In Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTrade, setRegTrade] = useState('Plumbing & Sanitary');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError(lang === 'hi' ? 'कृपया ईमेल/फोन एवं पासवर्ड दर्ज करें।' : 'Please enter your email or phone and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setError(lang === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required registration fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const role = selectedRole === 'provider' ? 'PROVIDER' : 'CONSUMER';
      const skills = selectedRole === 'provider' ? [regTrade, 'General Maintenance'] : undefined;

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          role,
          skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      setSuccessMsg(
        lang === 'hi'
          ? 'पंजीकरण सफल! आपका खाता सक्रिय हो गया है।'
          : 'Registration successful! Account activated.'
      );
      localStorage.setItem('token', data.token);
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1060,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card shadow-lg border"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--ux4g-bg-elevated, #ffffff)',
          color: 'var(--ux4g-text-primary, #0f172a)',
          borderRadius: '12px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-header border-bottom p-3 d-flex justify-content-between align-items-center bg-light">
          <div className="d-flex align-items-center gap-2">
            <div
              className="p-2 rounded border d-flex align-items-center justify-content-center"
              style={{
                background: 'var(--ux4g-bg-primary, #f2efff)',
                color: 'var(--ux4g-primary-600, #4a2bc2)',
              }}
            >
              <EmblemIcon size={20} />
            </div>
            <div>
              <h3 className="h6 fw-bold mb-0 text-dark">
                {lang === 'hi' ? 'सहकार कनेक्ट राष्ट्रीय पोर्टल' : 'SahakarConnect National Portal'}
              </h3>
              <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                Ministry of Cooperation · Multi-State Co-operative Societies Act, 2023
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-ghost text-secondary"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs: Sign In / Register */}
        <div className="border-bottom d-flex px-3 pt-2 bg-white">
          <button
            type="button"
            className={`btn btn-sm py-2 px-3 fw-bold border-0 border-bottom rounded-0 ${
              mode === 'signin'
                ? 'text-primary border-primary border-2'
                : 'text-secondary border-transparent'
            }`}
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
          >
            {lang === 'hi' ? 'प्रवेश (Sign In)' : 'Citizen & Member Sign In'}
          </button>
          <button
            type="button"
            className={`btn btn-sm py-2 px-3 fw-bold border-0 border-bottom rounded-0 ${
              mode === 'register'
                ? 'text-primary border-primary border-2'
                : 'text-secondary border-transparent'
            }`}
            onClick={() => {
              setMode('register');
              setError(null);
            }}
          >
            {lang === 'hi' ? 'नया पंजीकरण (Register)' : 'New Registration'}
          </button>
        </div>

        <div className="card-body p-3 p-md-4">
          {error && (
            <div className="alert alert-danger py-2 px-3 small border mb-3">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success py-2 px-3 small border mb-3 d-flex align-items-center gap-1">
              <CheckCircleIcon size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  {lang === 'hi' ? 'पंजीकृत ईमेल या मोबाइल नंबर' : 'Registered Email or Mobile Number'}
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted">
                    <UsersIcon size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. citizen@gmail.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  {lang === 'hi' ? 'पासवर्ड' : 'Password'}
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted">
                    <LockIcon size={14} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm w-100 py-2 fw-semibold mb-3"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : lang === 'hi' ? 'प्रवेश करें' : 'Sign In to Workspace'}
              </button>

              <div className="p-2 bg-light rounded border text-muted small text-center" style={{ fontSize: '0.72rem' }}>
                {lang === 'hi'
                  ? 'सुरक्षित राष्ट्रीय सहकारिता मंच • बहु-राज्य सहकारी सोसायटी अधिनियम 2023 के अंतर्गत पंजीकृत'
                  : 'Secured National Cooperative Gateway • MSCS Act 2023 Statutory Compliance'}
              </div>
            </form>
          )}

          {/* REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Account Type
                </label>
                <div className="btn-group btn-group-sm w-100" role="group">
                  <button
                    type="button"
                    className={`btn ${selectedRole === 'consumer' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedRole('consumer')}
                  >
                    <ConsumerIcon size={13} className="me-1" />
                    Citizen Consumer
                  </button>
                  <button
                    type="button"
                    className={`btn ${selectedRole === 'provider' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedRole('provider')}
                  >
                    <ProviderIcon size={13} className="me-1" />
                    Skilled Tradesman
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-secondary mb-1">Full Legal Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="name@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary mb-1">Mobile</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {selectedRole === 'provider' && (
                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    Primary Trade / Skill Category
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={regTrade}
                    onChange={(e) => setRegTrade(e.target.value)}
                  >
                    <option value="Plumbing & Sanitary">Plumbing &amp; Sanitary Maintenance</option>
                    <option value="Electrical Repair">Electrical &amp; Wiremen Services</option>
                    <option value="Carpentry & Woodwork">Carpentry &amp; Woodcraft</option>
                    <option value="Home Appliance Repair">Home Appliance &amp; HVAC Servicing</option>
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">Create Password</label>
                <input
                  type="password"
                  className="form-control form-control-sm"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading
                  ? 'Registering...'
                  : selectedRole === 'provider'
                  ? 'Enroll as Tradesman Member'
                  : 'Register Citizen Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
