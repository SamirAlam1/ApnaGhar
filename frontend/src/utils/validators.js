/**
 * frontend/src/utils/validators.js
 *
 * Client-side validation helpers.
 * Rules intentionally mirror the backend middleware so errors surface
 * instantly in the UI without a round-trip to the server.
 */

// ─── Email ────────────────────────────────────────────────────────────────────
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const BLOCKED_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'throwam.com', 'tempmail.com',
  'trashmail.com', 'yopmail.com', 'sharklasers.com', 'spam4.me',
  'dispostable.com', 'mailnull.com', 'maildrop.cc', 'discard.email',
  'fakeinbox.com', 'throwaway.email', 'getnada.com', 'filzmail.com',
  'getairmail.com', '10minutemail.com', 'minutemail.com', 'tempinbox.com',
];

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  const cleaned = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleaned)) return 'Please enter a valid email address';
  const domain = cleaned.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain)) return 'Disposable email addresses are not allowed';
  return null;
}

// ─── Password ─────────────────────────────────────────────────────────────────
export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Must contain at least one lowercase letter';
  if (!/\d/.test(password))    return 'Must contain at least one number';
  return null;
}

/** Returns a 0–4 strength score for the password strength indicator */
export function passwordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password))   score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

// ─── Phone ────────────────────────────────────────────────────────────────────
const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

const FAKE_PHONE_SET = new Set([
  '1234567890', '9876543210', '0123456789',
  '1111111111', '2222222222', '3333333333',
  '4444444444', '5555555555', '6666666666',
  '7777777777', '8888888888', '9999999999',
  '0000000000', '1234512345', '9999900000',
]);

export function validatePhone(phone) {
  if (!phone || !phone.trim()) return null; // optional field
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!PHONE_REGEX.test(cleaned)) {
    return 'Enter a valid 10-digit Indian mobile number (starts with 6–9)';
  }
  const digits = cleaned.replace(/^\+91|^0/, '');
  if (/^(\d)\1{9}$/.test(digits)) return 'Please enter a real phone number';
  if (FAKE_PHONE_SET.has(digits)) return 'Please enter a real phone number';
  return null;
}

// ─── Name ─────────────────────────────────────────────────────────────────────
export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required';
  const trimmed = name.trim();
  if (trimmed.length < 2)  return 'Name must be at least 2 characters';
  if (trimmed.length > 60) return 'Name cannot exceed 60 characters';
  // Allow English letters, spaces, Hindi (Devanagari) and Gujarati unicode ranges
  if (!/^[a-zA-Z\s\u0900-\u097F\u0A80-\u0AFF]+$/.test(trimmed)) {
    return 'Name can only contain letters and spaces';
  }
  return null;
}

// ─── Full form validators ─────────────────────────────────────────────────────
export function validateRegisterForm(form) {
  const errors = {};
  const nameErr  = validateName(form.name);
  const emailErr = validateEmail(form.email);
  const pwErr    = validatePassword(form.password);
  const phoneErr = validatePhone(form.phone);

  if (nameErr)  errors.name     = nameErr;
  if (emailErr) errors.email    = emailErr;
  if (pwErr)    errors.password = pwErr;
  if (phoneErr) errors.phone    = phoneErr;

  if (form.password && form.confirmPassword !== undefined) {
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors; // empty object === valid
}

export function validateLoginForm(form) {
  const errors = {};
  const emailErr = validateEmail(form.email);
  if (emailErr)      errors.email    = emailErr;
  if (!form.password) errors.password = 'Password is required';
  return errors;
}