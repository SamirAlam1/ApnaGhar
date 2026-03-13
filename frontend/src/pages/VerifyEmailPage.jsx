/**
 * frontend/src/pages/VerifyEmailPage.jsx
 *
 * Handles the /verify-email/:token route.
 * When a user clicks the verification link in their email, they land here.
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No token provided.'); return; }

    api.get(`/auth/verify-email/${token}`)
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
          'Verification link is invalid or has expired.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center space-y-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8"
      >
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">
                Email Verified! 🎉
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
            </div>
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold text-base hover:shadow-lg transition-all"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={36} className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
            </div>
            <div className="space-y-2">
              <Link
                to="/register"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-white font-bold text-sm"
              >
                Create a New Account
              </Link>
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}