import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// ✅ Field component BAHAR define kiya — yahi bug tha
const Field = ({ icon: Icon, label, type = 'text', value, onChange, error, onFocus, autoComplete }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
      error
        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
    }`}>
      <Icon size={16} className={error ? 'text-red-400' : 'text-gray-400'} />
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={label}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
      />
    </div>
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

export default function AuthPage({ mode = 'login' }) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'buyer';

  const isLogin = mode === 'login';

  const [role,     setRole]     = useState(defaultRole);
  const [showPass,  setShowPass]  = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [form,      setForm]      = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
  });

  const handleChange = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const clearError = (key) => {
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (!isLogin) {
      if (!form.name) errs.name = 'Name is required';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back! 🏡');
      } else {
        await register({ ...form, role });
        toast.success('Account created! Welcome to ApnaGhar 🎉');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80"
          alt="Indian property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 to-teal-800/75" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 group">
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
                '🇮🇳 English, Hindi & Gujarati',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-white/85 text-sm">{item}</div>
              ))}
            </div>
          </div>
          <p className="text-white/50 text-sm">© 2025 ApnaGhar. Made in India 🇮🇳</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
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
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
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

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">

            {/* Name */}
            {!isLogin && (
              <Field
                icon={User}
                label={t('auth.name')}
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                onFocus={() => clearError('name')}
                autoComplete="name"
              />
            )}

            {/* Email */}
            <Field
              icon={Mail}
              label={t('auth.email')}
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={errors.email}
              onFocus={() => clearError('email')}
              autoComplete="email"
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                errors.password
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
              }`}>
                <Lock size={16} className={errors.password ? 'text-red-400' : 'text-gray-400'} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  onFocus={() => clearError('password')}
                  placeholder={t('auth.password')}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-red-500 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={11} /> {errors.password}
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
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
                }`}>
                  <Lock size={16} className={errors.confirmPassword ? 'text-red-400' : 'text-gray-400'} />
                  <input
                    type={showPass2 ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    onFocus={() => clearError('confirmPassword')}
                    placeholder={t('auth.confirm_password')}
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass2(v => !v)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-500 text-xs mt-1 flex items-center gap-1"
                    >
                      <AlertCircle size={11} /> {errors.confirmPassword}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Phone */}
            {!isLogin && (
              <Field
                icon={Phone}
                label={t('auth.phone')}
                type="tel"
                value={form.phone}
                onChange={handleChange('phone')}
                error={errors.phone}
                onFocus={() => clearError('phone')}
                autoComplete="tel"
              />
            )}

            {/* Forgot password */}
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('auth.forgot')}
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold text-base hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-100 mt-2"
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
