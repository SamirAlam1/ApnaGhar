/**
 * frontend/src/pages/ResetPasswordPage.jsx
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validatePassword, passwordStrength } from '@/utils/validators';
import toast from 'react-hot-toast';

const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [success,   setSuccess]   = useState(false);

  const strength = passwordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const pwErr = validatePassword(password);
    if (pwErr) errs.password = pwErr;
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} className="text-green-600" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Password Reset!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to the homepage…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Set New Password</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              errors.password ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
            }`}>
              <Lock size={16} className={errors.password ? 'text-red-400' : 'text-gray-400'} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                placeholder="New password"
                autoComplete="new-password"
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-1.5">
                <div className="flex gap-1 h-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="flex-1 rounded-full transition-all" style={{ backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb' }} />
                  ))}
                </div>
              </div>
            )}
            {!errors.password && (
              <p className="text-gray-400 text-xs mt-1">Min 8 chars • uppercase • lowercase • number</p>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
              errors.confirm ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
            }`}>
              <Lock size={16} className={errors.confirm ? 'text-red-400' : 'text-gray-400'} />
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
              />
            </div>
            {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold text-base hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : 'Reset Password'}
          </button>

          <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-blue-600">
            Back to Login
          </Link>
        </form>
      </motion.div>
    </div>
  );
}