/**
 * frontend/src/pages/ForgotPasswordPage.jsx
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail } from '@/utils/validators';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Login
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Check your inbox</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              Check your spam folder if you don't see it within a few minutes.
            </p>
            <Link to="/login" className="block w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm text-center mt-4">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  error
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-500 bg-white dark:bg-gray-800'
                }`}>
                  <Mail size={16} className={error ? 'text-red-400' : 'text-gray-400'} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:outline-none"
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold text-base hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}