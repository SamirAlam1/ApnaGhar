/**
 * frontend/src/pages/AuthPage.jsx
 *
 * Secure, production-ready auth page with:
 *  - Real-time field-level validation (email format, disposable domains, phone)
 *  - Password strength indicator
 *  - Confirm-password match check
 *  - Submit button disabled until form is valid
 *  - Email verification banner after registration
 *  - Proper error messages surfaced from the API
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Eye, EyeOff, User, Mail, Lock, Phone,
  AlertCircle, ArrowRight, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  passwordStrength,
  validateRegisterForm,
  validateLoginForm,
} from '@/utils/validators';

// ─── Password strength bar ────────────────────────────────────────────────────
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

function PasswordStrengthBar({ password }) {
  const score = passwordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? STRENGTH_COLORS[score] : '#e5e7eb' }}
          />
        ))}
      </div>
      <p className="text-xs mt-1 transition-colors" style={{ color: STRENGTH_COLORS[score] }}>
        {STRENGTH_LABELS[score]}
      </p>
    </div>
  );
}

// ─── Reusable field component ─────────────────────────────────────────────────
function Field({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  autoComplete,
  hint,
  rightElement,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
          error
            ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
            : success
            ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
        }`}
      >
        <Icon
          size={16}
          className={
            error ? 'text-red-400' : success ? 'text-green-500' : 'text-gray-400'
          }
        />
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={label}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
        />
        {rightElement}
        {success && !rightElement && (
          <CheckCircle2 size={15} className="text-green-500 shrink-0" />
        )}
      </div>
      {hint && !error && (
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{hint}</p>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 text-xs mt-1 flex items-center gap-1"
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Verification banner ──────────────────────────────────────────────────────
function VerificationBanner({ email, onResend, resending }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto">
        <Mail size={32} className="text-teal-600 dark:text-teal-400" />
      </div>
      <div>
        <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
          Check your inbox!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          We sent a verification link to{' '}
          <strong className="text-gray-800 dark:text-gray-200">{email}</strong>.
          <br />
          Please click the link to activate your account.
        </p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left space-y-1">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Tips:</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">• Check your Spam / Promotions folder</p>
        <p className="text-xs text-blue-600 dark:text-blue-400">• Link expires in 24 hours</p>
      </div>
      <button
        onClick={onResend}
        disabled={resending}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
      >
        {resending ? 'Sending…' : 'Resend verification email'}
      </button>
      <Link
        to="/login"
        className="block w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:border-blue-400 transition-colors"
      >
        Back to Login
      </Link>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AuthPage({ mode = 'login' }) {
  const { t } = useTranslation();
  const { login, register, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'buyer';

  const isLogin = mode === 'login';

  const [role,      setRole]      = useState(defaultRole);
  const [showPass,  setShowPass]  = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [touched,   setTouched]   = useState({});
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
  });

  // ── Live validation (only for touched fields) ──
  const liveErrors = useMemo(() => {
    const errs = {};
    if (touched.name  && !isLogin)  { const e = validateName(form.name);              if (e) errs.name  = e; }
    if (touched.email)               { const e = validateEmail(form.email);             if (e) errs.email = e; }
    if (touched.password)            { const e = validatePassword(form.password);       if (e) errs.password = e; }
    if (touched.phone && !isLogin)   { const e = validatePhone(form.phone);             if (e) errs.phone = e; }
    if (touched.confirmPassword && !isLogin && form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return { ...errs, ...errors }; // merge server errors
  }, [form, touched, errors, isLogin]);

  // ── Is the form submittable? ──
  const isFormValid = useMemo(() => {
    if (isLogin) {
      return !validateEmail(form.email) && form.password.length > 0;
    }
    return (
      !validateName(form.name) &&
      !validateEmail(form.email) &&
      !validatePassword(form.password) &&
      !validatePhone(form.phone) &&
      form.password === form.confirmPassword
    );
  }, [form, isLogin]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    // Clear server-side error for this field when user types
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleBlur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show all errors
    const allFields = isLogin
      ? { email: true, password: true }
      : { name: true, email: true, password: true, confirmPassword: true, phone: true };
    setTouched(allFields);

    const formErrors = isLogin
      ? validateLoginForm(form)
      : validateRegisterForm(form);

    if (Object.keys(formErrors).length) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back! 🏡');
        navigate('/');
      } else {
        const result = await register({ ...form, role });
        if (result?.data?.emailVerificationRequired) {
          setRegisteredEmail(form.email);
          setRegistered(true);
        } else {
          toast.success('Account created! Welcome to ApnaGhar 🎉');
          navigate('/');
        }
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed';

      // Parse field-level errors returned from the API
      if (err.errors && typeof err.errors === 'object') {
        setErrors(err.errors);
      } else if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg });
      } else if (msg.toLowerCase().includes('password')) {
        setErrors({ password: msg });
      } else if (msg.toLowerCase().includes('phone')) {
        setErrors({ phone: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification ──
  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(registeredEmail);
      toast.success('Verification email resent! Check your inbox.');
    } catch {
      toast.error('Could not resend — please try again');
    } finally {
      setResending(false);
    }
  };

  // ── Verification success screen ──
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm">
          <VerificationBanner
            email={registeredEmail}
            onResend={handleResend}
            resending={resending}
          />
        </div>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className="min-h-screen flex">

      {/* Left panel — desktop */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80"
          alt="Indian property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 to-teal-800/75" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="ApnaGhar Logo" className="h-10 w-10" />
            <span className="font-display font-bold text-2xl">
              Apna<span className="text-teal-300">Ghar</span>
            </span>
          </Link>
          <div>
            <h2 className="font-display font-bold text-4xl mb-4 leading-tight">
              {isLogin
                ? 'Welcome Back to Your Dream Home Search'
                : 'Join 50,000+ Families Finding Their Dream Home'}
            </h2>
            <p className="text-white/75 text-lg leading-relaxed mb-8">
              India's most trusted AI-powered real estate marketplace.
              Verified listings, RERA compliance, direct seller connect.
            </p>
            <div className="flex flex-col gap-3">
              {[
                '✅ 10,000+ Verified Properties',
                '🤖 AI-Powered Recommendations',
                '🛡️ Secure & Verified Accounts',
                '🇮🇳 English, Hindi & Gujarati',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/85 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/50 text-sm">© 2025 ApnaGhar. Made in India 🇮🇳</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm py-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <img src="/logo.svg" alt="ApnaGhar Logo" className="h-9 w-9" />
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
              Apna<span className="text-teal-500">Ghar</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">
            {isLogin ? t('auth.sign_in') : t('auth.sign_up')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {isLogin ? t('auth.sign_up') : t('auth.sign_in')}
            </Link>
          </p>

          {/* Role toggle — register only */}
          {!isLogin && (
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
              {[['buyer', '🏠 Buyer'], ['seller', '🏢 Seller']].map(([r, label]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    role === r
                      ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="on">

            {/* Name */}
            {!isLogin && (
              <Field
                icon={User}
                label={t('auth.name')}
                value={form.name}
                onChange={handleChange('name')}
                onBlur={handleBlur('name')}
                error={liveErrors.name}
                success={touched.name && !validateName(form.name)}
                autoComplete="name"
                hint="2–60 letters (English, Hindi or Gujarati)"
              />
            )}

            {/* Email */}
            <Field
              icon={Mail}
              label={t('auth.email')}
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={liveErrors.email}
              success={touched.email && !validateEmail(form.email)}
              autoComplete="email"
              hint={!isLogin ? 'A verification link will be sent to this address' : undefined}
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  liveErrors.password
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                    : touched.password && !validatePassword(form.password)
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
                }`}
              >
                <Lock
                  size={16}
                  className={
                    liveErrors.password
                      ? 'text-red-400'
                      : touched.password && !validatePassword(form.password)
                      ? 'text-green-500'
                      : 'text-gray-400'
                  }
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder={t('auth.password')}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {!isLogin && <PasswordStrengthBar password={form.password} />}
              {!isLogin && !liveErrors.password && (
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Min 8 chars • uppercase • lowercase • number
                </p>
              )}
              <AnimatePresence>
                {liveErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={11} /> {liveErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('auth.confirm_password')}
                </label>
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    liveErrors.confirmPassword
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : touched.confirmPassword && form.password === form.confirmPassword && form.confirmPassword
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
                  }`}
                >
                  <Lock
                    size={16}
                    className={
                      liveErrors.confirmPassword
                        ? 'text-red-400'
                        : touched.confirmPassword && form.password === form.confirmPassword && form.confirmPassword
                        ? 'text-green-500'
                        : 'text-gray-400'
                    }
                  />
                  <input
                    type={showPass2 ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    placeholder={t('auth.confirm_password')}
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass2((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                    aria-label={showPass2 ? 'Hide password' : 'Show password'}
                  >
                    {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {touched.confirmPassword &&
                    form.password === form.confirmPassword &&
                    form.confirmPassword && (
                      <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    )}
                </div>
                <AnimatePresence>
                  {liveErrors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={11} /> {liveErrors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Phone */}
            {!isLogin && (
              <Field
                icon={Phone}
                label={`${t('auth.phone')} (optional)`}
                type="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={liveErrors.phone}
                success={touched.phone && form.phone && !validatePhone(form.phone)}
                autoComplete="tel"
                hint="10-digit Indian mobile number (starts with 6–9)"
              />
            )}

            {/* Forgot password */}
            {isLogin && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('auth.forgot')}
                </Link>
              </div>
            )}

            {/* Security badge — register */}
            {!isLogin && (
              <div className="flex items-center gap-2 py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <ShieldCheck size={15} className="text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-green-700 dark:text-green-400 text-xs">
                  Your data is encrypted and secure. We'll send a verification email to confirm your address.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold text-base hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-100 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t('auth.sign_in') : t('auth.sign_up')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}