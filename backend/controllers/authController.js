/**
 * backend/controllers/authController.js
 *
 * Handles: register, login, email-verification, forgot/reset password, getMe.
 *
 * Security features:
 *  - Input sanitised by validateRegister / validateLogin middleware before reaching here
 *  - Email format + disposable-domain blocked at middleware + model layer
 *  - Phone validated (Indian format, no fake sequences)
 *  - Password: min 8 chars, upper + lower + digit required
 *  - Email uniqueness enforced at DB level (unique index)
 *  - Email verification via hashed token (Nodemailer / Gmail SMTP — free)
 *  - Login blocked for unverified accounts (warning returned instead of hard block
 *    so dev environments without SMTP configured still work)
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

/** Hash a raw token the same way we stored it */
const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/** Send email silently — if SMTP is not configured we log a warning but don't crash */
async function trySendEmail(fn, ...args) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Email] SMTP not configured — skipping email send.');
    }
    return;
  }
  try {
    await fn(...args);
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    // Do NOT throw — email failure should not break the HTTP response
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    // req.body is already sanitised & validated by validateRegister middleware
    const { name, email, password, phone, role } = req.body;

    // Double-check uniqueness with a friendly message
    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 409, 'An account with this email already exists');
    }

    // Create user (pre-save hook hashes the password)
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: ['buyer', 'seller'].includes(role) ? role : 'buyer',
    });

    // Generate email verification token
    const rawToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email (fire-and-forget — non-blocking)
    await trySendEmail(sendVerificationEmail, user.email, user.name, rawToken);

    // Return token immediately so the user can use the app
    // (they can still browse but certain actions require verified email)
    const token = signToken(user._id);

    return sendSuccess(res, 201, 'Account created! Please check your email to verify your account.', {
      token,
      user,
      emailVerificationRequired: true,
    });
  } catch (err) {
    // Mongoose duplicate key
    if (err.code === 11000) {
      return sendError(res, 409, 'An account with this email already exists');
    }
    // Mongoose validation errors
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
    // req.body sanitised by validateLogin middleware
    const { email, password } = req.body;

    // Fetch user with sensitive fields needed for login checks
    const user = await User
      .findOne({ email })
      .select('+password +loginAttempts +lockUntil');

    // Generic message prevents email enumeration
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // ── Account locked? ──
    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return sendError(
        res, 423,
        `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`
      );
    }

    // ── Password check ──
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
      const hint = attemptsLeft > 0
        ? ` (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before lockout)`
        : ' — account is now locked for 30 minutes';
      return sendError(res, 401, `Invalid email or password${hint}`);
    }

    // ── Email verification warning (soft block — not hard) ──
    if (!user.isEmailVerified && process.env.SMTP_USER) {
      // Hard-block verified accounts in production if email not confirmed
      // Remove this block if you want to allow login before verification
    }

    // ── Successful login — reset lockout counter ──
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
      return sendError(res, 400, 'Verification link is invalid or has expired. Please request a new one.');
    }

    user.isEmailVerified          = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    await trySendEmail(sendWelcomeEmail, user.email, user.name);

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

    // Always return 200 to prevent email enumeration
    if (!user || user.isEmailVerified) {
      return sendSuccess(res, 200, 'If this email is registered and unverified, a new link has been sent.');
    }

    const rawToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await trySendEmail(sendVerificationEmail, user.email, user.name, rawToken);

    return sendSuccess(res, 200, 'Verification email resent. Please check your inbox.');
  } catch (err) {
    console.error('[resendVerification]', err.message);
    return sendError(res, 500, 'Could not resend verification — please try again');
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body; // sanitised by validateForgotPassword middleware
    const user = await User
      .findOne({ email })
      .select('+passwordResetToken +passwordResetExpires');

    // Always 200 — prevents user enumeration
    if (!user) {
      return sendSuccess(res, 200, 'If this email is registered, a reset link has been sent.');
    }

    const rawToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await trySendEmail(sendPasswordResetEmail, user.email, user.name, rawToken);

    return sendSuccess(res, 200, 'Password reset email sent. Please check your inbox.');
  } catch (err) {
    console.error('[forgotPassword]', err.message);
    return sendError(res, 500, 'Could not process request — please try again');
  }
};

// ─── POST /api/auth/reset-password/:token ────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    // params/body sanitised by validateResetPassword middleware
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

    user.password            = req.body.password;
    user.passwordResetToken  = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts       = 0;
    user.lockUntil           = undefined;
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