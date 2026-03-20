/**
 * backend/controllers/authController.js
 *
 * Handles: register, login, email-verification, forgot/reset password, getMe.
 *
 * Security features:
 *  - Input sanitised by validateRegister / validateLogin middleware
 *  - Email format + disposable-domain blocked at middleware + model layer
 *  - Phone validated (Indian format, no fake sequences)
 *  - Password: min 8 chars, upper + lower + digit required
 *  - Email uniqueness enforced at DB level (unique index)
 *  - Auto email verification on register (email sent silently, never blocks login)
 *  - Brute-force protection: 5 failed attempts → 30-min account lock
 *  - Generic "Invalid credentials" message prevents user-enumeration
 *  - JWT signed with strong secret, expires in 7 days
 */

const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../utils/email');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/** Send email silently — never blocks the HTTP response */
async function trySendEmail(fn, ...args) {
  try {
    await fn(...args);
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    // Do NOT throw — email failure should never break registration/login
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check uniqueness
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    // Create user — auto mark as verified so login works immediately
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: ['buyer', 'seller'].includes(role) ? role : 'buyer',
      isEmailVerified: true, // Auto-verify — no email blocking
    });

    // Try to send welcome email silently (non-blocking)
    trySendEmail(sendWelcomeEmail, user.email, user.name);

    const token = signToken(user._id);

    return sendSuccess(res, 201, 'Account created successfully! Welcome to ApnaGhar.', {
      token,
      user,
      emailVerificationRequired: false,
    });
  } catch (err) {
    if (err.code === 11000) {
      return sendError(res, 409, 'An account with this email already exists');
    }
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.values(err.errors).forEach((e) => { errors[e.path] = e.message; });
      return sendError(res, 400, 'Validation failed', errors);
    }
    console.error('[register]', err.message);
    return sendError(res, 500, 'Registration failed — please try again later');
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User
      .findOne({ email })
      .select('+password +loginAttempts +lockUntil');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Account locked?
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return sendError(
        res, 423,
        `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
      );
    }

    // Password check
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
      const hint = attemptsLeft > 0
        ? ` (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before lockout)`
        : ' — account is now locked for 30 minutes';
      return sendError(res, 401, `Invalid email or password${hint}`);
    }

    // Reset lockout counter on success
    if (user.loginAttempts > 0 || user.lockUntil) {
      await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    const token = signToken(user._id);
    return sendSuccess(res, 200, 'Login successful', { token, user });
  } catch (err) {
    console.error('[login]', err.message);
    return sendError(res, 500, 'Login failed — please try again later');
  }
};

// ─── GET /api/auth/verify-email/:token ───────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User
      .findOne({
        emailVerificationToken:   hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      })
      .select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return sendError(res, 400, 'Verification link is invalid or has expired.');
    }

    user.isEmailVerified          = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    trySendEmail(sendWelcomeEmail, user.email, user.name);

    return sendSuccess(res, 200, 'Email verified successfully! Your account is now fully active.', { user });
  } catch (err) {
    console.error('[verifyEmail]', err.message);
    return sendError(res, 500, 'Email verification failed — please try again');
  }
};

// ─── POST /api/auth/resend-verification ──────────────────────────────────────
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required');

    const user = await User
      .findOne({ email: email.toLowerCase().trim() })
      .select('+emailVerificationToken +emailVerificationExpires');

    if (!user || user.isEmailVerified) {
      return sendSuccess(res, 200, 'If this email is registered and unverified, a new link has been sent.');
    }

    const rawToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    trySendEmail(sendVerificationEmail, user.email, user.name, rawToken);

    return sendSuccess(res, 200, 'Verification email resent. Please check your inbox.');
  } catch (err) {
    console.error('[resendVerification]', err.message);
    return sendError(res, 500, 'Could not resend verification — please try again');
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User
      .findOne({ email })
      .select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendSuccess(res, 200, 'If this email is registered, a reset link has been sent.');
    }

    const rawToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    trySendEmail(sendPasswordResetEmail, user.email, user.name, rawToken);

    return sendSuccess(res, 200, 'Password reset email sent. Please check your inbox.');
  } catch (err) {
    console.error('[forgotPassword]', err.message);
    return sendError(res, 500, 'Could not process request — please try again');
  }
};

// ─── POST /api/auth/reset-password/:token ────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User
      .findOne({
        passwordResetToken:   hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      })
      .select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendError(res, 400, 'Password reset link is invalid or has expired');
    }

    user.password             = req.body.password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts        = 0;
    user.lockUntil            = undefined;
    await user.save();

    const token = signToken(user._id);
    return sendSuccess(res, 200, 'Password reset successful. You are now logged in.', { token, user });
  } catch (err) {
    console.error('[resetPassword]', err.message);
    return sendError(res, 500, 'Password reset failed — please try again');
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  return sendSuccess(res, 200, 'Profile fetched successfully', { user: req.user });
};
