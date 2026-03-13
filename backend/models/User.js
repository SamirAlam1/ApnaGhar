const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─── Phone validation helper ─────────────────────────────────────────────────
// Accepts Indian mobile numbers:
//   - 10 digits starting with 6–9  (e.g. 9876543210)
//   - Optionally prefixed with +91 or 0  (e.g. +919876543210, 09876543210)
// Rejects obvious fake sequences (all same digit, ascending/descending runs)
const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

const FAKE_PHONE_PATTERNS = [
  /^(\d)\1{9}$/,            // all same digit: 0000000000, 1111111111 …
  /^(?:0123456789|1234567890|9876543210|9999999999|1111111111|0000000000|1234512345|9999900000)$/,
];

function isValidPhone(phone) {
  if (!phone) return true; // phone is optional
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!PHONE_REGEX.test(cleaned)) return false;
  const digits = cleaned.replace(/^\+91|^0/, '');
  for (const pattern of FAKE_PHONE_PATTERNS) {
    if (pattern.test(digits)) return false;
  }
  return true;
}

// ─── Email validation ─────────────────────────────────────────────────────────
// RFC-5321-inspired regex — stricter than the bare \S+@\S+ pattern
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// Block obviously disposable / test domains
const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'throwam.com', 'tempmail.com',
  'trashmail.com', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'spam4.me', 'dispostable.com',
  'mailnull.com', 'spamgourmet.com', 'maildrop.cc', 'discard.email',
  'fakeinbox.com', 'throwaway.email', 'getnada.com', 'filzmail.com',
  'getairmail.com', '10minutemail.com', 'minutemail.com', 'tempinbox.com',
];

function isBlockedEmailDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
      match: [/^[a-zA-Z\s\u0900-\u097F\u0A80-\u0AFF]+$/, 'Name can only contain letters and spaces'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [
        {
          validator: (v) => EMAIL_REGEX.test(v),
          message: 'Please provide a valid email address',
        },
        {
          validator: (v) => !isBlockedEmailDomain(v),
          message: 'Disposable / temporary email addresses are not allowed',
        },
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },

    phone: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: isValidPhone,
        message: 'Please provide a valid Indian mobile number (10 digits, starting with 6–9)',
      },
    },

    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },

    avatar: {
      type: String,
      default: '',
    },

    // ── Email verification ──────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // ── Password reset ──────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── Account lockout (brute-force protection) ────────────────────────────
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      select: false,
    },

    savedSearches: [
      {
        filters: Object,
        name: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// ─── Virtual: account is locked ───────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─── Hash password before save ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Compare plain password with hash ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─── Increment failed login counter / lock account ───────────────────────────
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

userSchema.methods.incLoginAttempts = async function () {
  // Reset lock if it has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates);
};

// ─── Generate email verification token ───────────────────────────────────────
userSchema.methods.generateEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return rawToken; // send this raw token via email
};

// ─── Generate password reset token ───────────────────────────────────────────
userSchema.methods.generatePasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return rawToken;
};

// ─── Strip sensitive fields from JSON output ──────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: false });
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

module.exports = mongoose.model('User', userSchema);