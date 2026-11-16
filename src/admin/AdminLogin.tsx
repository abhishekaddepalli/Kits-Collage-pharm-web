import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';
import { useCms } from '../app/providers/CmsContext';
import { KitsLogo } from '../components/common/KitsLogo';
import { SeoHead } from '../components/common/SeoHead';
import { authService } from '../services/auth/authService';

type AuthViewMode = 'login' | 'forgot' | 'reset';

export const AdminLogin: React.FC = () => {
  const { state, session, authChecked, installed, loading, login, adminLoginPath, adminPanelPath } = useCms();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialMode: AuthViewMode = location.pathname.includes('reset-password')
    ? 'reset'
    : location.pathname.includes('forgot-password')
      ? 'forgot'
      : 'login';

  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const [resetEmail, setResetEmail] = useState(() => searchParams.get('email') || '');
  const [resetToken, setResetToken] = useState(() => searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setNotice('');
  }, [initialMode]);

  useEffect(() => {
    if (authChecked && session?.isAuthenticated) {
      navigate(adminPanelPath, { replace: true });
    }
  }, [authChecked, session, navigate, adminPanelPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your administrator username or email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');

    const res = await login(identifier.trim(), password, remember);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Invalid username/email or password.');
      return;
    }
    navigate(adminPanelPath, { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your registered administrator email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await authService.forgotPassword(resetEmail.trim());
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message || 'Unable to process password reset request.');
      return;
    }
    setNotice(res.message);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetToken.trim() || newPassword.length < 8) {
      setError('Please provide email, reset token, and a new password of at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await authService.resetPassword({
      email: resetEmail.trim(),
      token: resetToken.trim(),
      password: newPassword,
      password_confirmation: confirmPassword,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message || 'Password reset failed.');
      return;
    }
    setNotice(res.message);
    setNewPassword('');
    setConfirmPassword('');
    setMode('login');
  };

  if (!loading && !installed) {
    return (
      <div className="min-h-screen bg-[#FCFAFF] flex flex-col justify-center items-center p-4">
        <SeoHead noIndex pageTitle="Setup Required | KITS CMS" />
        <div className="w-full max-w-md bg-white border border-[#E8DFF5] rounded-2xl shadow-lg p-7 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-[#52128B] mx-auto" />
          <h1 className="text-xl font-bold text-[#171238]">First-Time Installation Required</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            No Super Administrator account exists yet. Complete the installation wizard to configure your MySQL
            database and create your initial administrator credentials.
          </p>
          <Link
            to="/install"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] hover:bg-[#32105B] rounded-full"
          >
            Launch Installation Wizard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFF] flex flex-col justify-center items-center p-4">
      <SeoHead
        noIndex
        pageTitle="Administrator Sign In | KITS College of Pharmacy for Women"
        pageDescription="Protected CMS authentication portal."
      />
      <div className="w-full max-w-md bg-white border border-[#E8DFF5] rounded-2xl shadow-lg p-7 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <KitsLogo
            logoUrl={state.header.logoUrl}
            title={state.header.collegeName}
            subtitle={state.header.collegeSubtitle}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#171238]">
              {mode === 'login'
                ? 'Administrator Sign In'
                : mode === 'forgot'
                  ? 'Reset Administrator Password'
                  : 'Complete Password Reset'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'login'
                ? 'Protected institutional control panel access'
                : mode === 'forgot'
                  ? 'Request a time-limited reset link for your registered account'
                  : 'Enter your reset token and choose a strong new password'}
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
            {error}
          </div>
        )}

        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
            <span>{notice}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-identifier" className="block text-xs font-semibold text-[#171238] mb-1.5">
                Username or Email Address
              </label>
              <input
                id="admin-identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E8DFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52128B]"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-[#171238] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-[#E8DFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52128B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setNotice('');
                  setMode('forgot');
                }}
                className="font-semibold text-[#52128B] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#52128B] hover:bg-[#32105B] disabled:opacity-60 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {submitting ? 'Verifying Credentials...' : 'Sign In to Control Panel'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-[#171238] mb-1.5">
                Registered Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@college-domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-[#E8DFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52128B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#52128B] hover:bg-[#32105B] disabled:opacity-60 rounded-full transition-colors cursor-pointer"
            >
              {submitting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
                className="text-slate-600 hover:text-[#52128B] cursor-pointer"
              >
                ← Back to Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('reset');
                }}
                className="text-[#52128B] font-semibold hover:underline cursor-pointer"
              >
                I already have a token
              </button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-[#171238] mb-1">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="reset-token" className="block text-xs font-semibold text-[#171238] mb-1">
                Reset Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-token"
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reset-new-password" className="block text-xs font-semibold text-[#171238] mb-1">
                New Password (min 8 characters)
              </label>
              <input
                id="reset-new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
              />
            </div>
            <div>
              <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-[#171238] mb-1">
                Confirm New Password
              </label>
              <input
                id="reset-confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-[#E8DFF5] rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#52128B] hover:bg-[#32105B] disabled:opacity-60 rounded-full transition-colors cursor-pointer"
            >
              {submitting ? 'Updating Password...' : 'Reset Password'}
            </button>

            <div className="text-center text-xs">
              <Link
                to={adminLoginPath}
                onClick={() => setMode('login')}
                className="text-slate-600 hover:text-[#52128B]"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-[#E8DFF5] flex items-center justify-between text-xs">
          <Link to="/" className="inline-flex items-center gap-1 text-[#52128B] font-semibold hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
          </Link>
          <span className="text-slate-400">Session Cookie Auth</span>
        </div>
      </div>
    </div>
  );
};
