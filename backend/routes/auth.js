/**
 * backend/routes/auth.js
 *
 * All routes pass through the appropriate validation middleware
 * before reaching the controller, so controllers receive only
 * sanitised, pre-validated data.
 */

const router = require('express').Router();

const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const {
  validateRegister,
  validateLogin,
  validateVerifyToken,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validate');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register',              validateRegister,      register);
router.post('/login',                 validateLogin,         login);
router.get( '/verify-email/:token',   validateVerifyToken,   verifyEmail);
router.post('/resend-verification',                          resendVerification);
router.post('/forgot-password',       validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// ── Protected routes ──────────────────────────────────────────────────────────
router.get('/me', protect, getMe);

module.exports = router;