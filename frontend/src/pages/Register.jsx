import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Blob({ style }) {
  return (
    <div
      className="animate-blob absolute rounded-full mix-blend-screen filter blur-3xl opacity-20"
      style={style}
    />
  );
}

function InputField({ label, type = 'text', value, onChange, error, autoComplete, rightElement }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className="w-full pt-6 pb-2 px-4 rounded-xl text-white text-sm outline-none transition-all duration-300"
          style={{
            background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.04)',
            border: focused
              ? '1px solid rgba(99,102,241,0.5)'
              : error
              ? '1px solid rgba(239,68,68,0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
          }}
        />
        <label
          className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
          style={{
            top: focused || hasValue ? '8px' : '50%',
            transform: focused || hasValue ? 'none' : 'translateY(-50%)',
            fontSize: focused || hasValue ? '10px' : '13px',
            color: focused ? '#818cf8' : error ? '#f87171' : 'rgba(255,255,255,0.35)',
            letterSpacing: focused || hasValue ? '0.06em' : '0',
            textTransform: focused || hasValue ? 'uppercase' : 'none',
          }}
        >
          {label}
        </label>
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: 'Weak', color: '#ef4444' },
      { level: 2, label: 'Fair', color: '#f59e0b' },
      { level: 3, label: 'Good', color: '#6366f1' },
      { level: 4, label: 'Strong', color: '#10b981' },
    ];
    return levels[score];
  };

  const { level, label, color } = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              height: '3px',
              background: i <= level ? color : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/onboarding');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const eyeToggle = (show, setShow) => (
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="text-white/30 hover:text-white/70 transition-colors p-1"
    >
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ background: '#0a0a0f' }}
    >
      <Blob style={{ width: 500, height: 500, background: '#8b5cf6', top: '-200px', right: '-100px', animationDelay: '0s' }} />
      <Blob style={{ width: 400, height: 400, background: '#6366f1', bottom: '-150px', left: '-100px', animationDelay: '2s' }} />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div
        className="relative z-10 w-full max-w-md mx-4 animate-slide-up"
        style={{
          background: 'rgba(15,15,25,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.5rem',
          backdropFilter: 'blur(40px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
          padding: '2.5rem',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/40 text-sm">Join FraudShield — AI Fraud Detection</p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm animate-slide-down"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            autoComplete="name"
          />
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <div>
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
              rightElement={eyeToggle(showPassword, setShowPassword)}
            />
            <PasswordStrength password={password} />
          </div>
          <InputField
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            rightElement={eyeToggle(showConfirm, setShowConfirm)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-2 transition-all duration-300"
            style={{
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Creating account…
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-white/40 text-sm">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors"
            style={{ color: '#818cf8' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
