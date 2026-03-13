/**
 * backend/middleware/validate.js
 *
 * Centralised input-validation middleware.
 * Each exported function is an Express middleware that sanitises &
 * validates req.body, then calls next() or returns a 400 error.
 */

const { sendError } = require('../utils/response');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strip HTML tags and null bytes — basic XSS / injection defence.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/\0/g, '')               // strip null bytes
    .trim();
}

/**
 * Strict email format check.
 * Rejects disposable domains and obviously invalid formats.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'throwam.com', 'tempmail.com',
  'trashmail.com', 'yopmail.com', 'sharklasers.com', 'spam4.me',
  'dispostable.com', 'mailnull.com', 'maildrop.cc', 'discard.email',
  'fakeinbox.com', 'throwaway.email', 'getnada.com', 'filzmail.com',
  'getairmail.com', '10minutemail.com', 'minutemail.com', 'tempinbox.com',
  'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'grr.la',
];

function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  const cleaned = email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(cleaned)) return 'Please provide a valid email address';
  const domain = cleaned.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain)) return 'Disposable email addresses are not allowed';
  return null; // valid
}

/**
 * Indian mobile number validation.
 * Valid: +91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX (10 digits, starts with 6–9)
 * Invalid: all-same-digit, well-known fake sequences, non-numeric junk.
 */
const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

const FAKE_SEQUENCES = new Set([
  '1234567890', '9876543210', '0123456789',
  '1111111111', '2222222222', '3333333333',
  '4444444444', '5555555555', '6666666666',
  '7777777777', '8888888888', '9999999999',
  '0000000000', '1234512345', '9999900000',
  '9876512345', '1234567891',
]);

function validatePhone(phone) {
  if (!phone || phone.trim() === '') return null; // optional field
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!PHONE_REGEX.test(cleaned)) {
    return 'Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8 or 9)';
  }
  const digits = cleaned.replace(/^\+91|^0/, '');
  // All same digit check
  if (/^(\d)\1{9}$/.test(digits)) return 'Please enter a real phone number';
  if (FAKE_SEQUENCES.has(digits)) return 'Please enter a real phone number';
  return null;
}

/**
 * Password strength check.
 * Min 8 chars, at least one uppercase, one lowercase, one digit.
 */
function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
}

// ─── Exported middleware ──────────────────────────────────────────────────────

/**
 * Validate + sanitise registration payload.
 */
exports.validateRegister = (req, res, next) => {
  const errors = {};

  // Sanitise all string inputs
  const name     = sanitizeString(req.body.name);
  const email    = sanitizeString(req.body.email);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const phone    = sanitizeString(req.body.phone || '');
  const role     = sanitizeString(req.body.role || 'buyer');

  // ── Name ──
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 60) {
    errors.name = 'Name cannot exceed 60 characters';
  } else if (!/^[a-zA-Z\s\u0900-\u097F\u0A80-\u0AFF]+$/.test(name)) {
    errors.name = 'Name can only contain letters and spaces';
  }

  // ── Email ──
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  // ── Password ──
  const pwErr = validatePassword(password);
  if (pwErr) errors.password = pwErr;

  // ── Phone ──
  const phoneErr = validatePhone(phone);
  if (phoneErr) errors.phone = phoneErr;

  // ── Role ──
  if (!['buyer', 'seller'].includes(role)) {
    errors.role = 'Role must be either buyer or seller';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  // Replace body with sanitised values
  req.body = { name, email: email.toLowerCase(), password, phone, role };
  return next();
};

/**
 * Validate + sanitise login payload.
 */
exports.validateLogin = (req, res, next) => {
  const errors = {};

  const email    = sanitizeString(req.body.email);
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    return sendError(res, 400, 'Validation failed', errors);
  }

  req.body = { email: email.toLowerCase(), password };
  return next();
};

/**
 * Validate token param for email verification.
 */
exports.validateVerifyToken = (req, res, next) => {
  const token = sanitizeString(req.params.token || '');
  if (!token || token.length < 32) {
    return sendError(res, 400, 'Invalid or missing verification token');
  }
  req.params.token = token;
  return next();
};

/**
 * Validate forgot-password request body.
 */
exports.validateForgotPassword = (req, res, next) => {
  const email = sanitizeString(req.body.email);
  const emailErr = validateEmail(email);
  if (emailErr) return sendError(res, 400, emailErr);
  req.body.email = email.toLowerCase();
  return next();
};

/**
 * Validate reset-password request.
 */
exports.validateResetPassword = (req, res, next) => {
  const token    = sanitizeString(req.params.token || '');
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!token || token.length < 32) {
    return sendError(res, 400, 'Invalid or missing reset token');
  }

  const pwErr = validatePassword(password);
  if (pwErr) return sendError(res, 400, pwErr);

  req.params.token = token;
  req.body.password = password;
  return next();
};

// Export helpers so the controller can reuse them if needed
exports.validateEmail    = validateEmail;
exports.validatePhone    = validatePhone;
exports.validatePassword = validatePassword;