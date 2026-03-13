# 🔐 Authentication System — ApnaGhar

## Overview

ApnaGhar uses a JWT-based authentication system with layered security controls:
email verification, password strength enforcement, brute-force protection, and
phone number validation. All services used are **free**.

---

## Registration Flow

```
User fills form
       ↓
Frontend validates (validators.js)
       ↓
POST /api/auth/register
       ↓
validateRegister middleware
  • Sanitise all inputs (strip HTML/null bytes)
  • Validate email format + block disposable domains
  • Validate password strength (8+ chars, upper, lower, digit)
  • Validate Indian phone format (optional)
  • Validate name (letters only, 2–60 chars)
       ↓
Check email uniqueness in MongoDB
       ↓
Create user (bcrypt hashes password automatically via pre-save hook)
       ↓
Generate email verification token (SHA-256 hashed, stored in DB, 24-hour expiry)
       ↓
Send verification email via Nodemailer / Gmail SMTP
       ↓
Return JWT + user object + emailVerificationRequired: true
       ↓
Frontend shows "Check your inbox" screen
```

---

## Email Verification Flow

```
User clicks link in email → /verify-email/<raw-token>
       ↓
GET /api/auth/verify-email/:token
       ↓
validateVerifyToken middleware (sanitise token)
       ↓
Hash the raw token with SHA-256
       ↓
Find user where emailVerificationToken === hash AND expiry > now
       ↓
Mark isEmailVerified = true, clear token fields
       ↓
Send welcome email
       ↓
Return success → frontend shows "Email Verified" screen
```

---

## Login Flow

```
User submits email + password
       ↓
Frontend validates (validators.js)
       ↓
POST /api/auth/login
       ↓
validateLogin middleware (sanitise + validate format)
       ↓
Fetch user (with password, loginAttempts, lockUntil fields)
       ↓
Check if account is locked
  → If locked: return 423 with minutes remaining
       ↓
Compare password with bcrypt
  → If mismatch: increment loginAttempts, return 401 with attempts remaining
  → After 5 failures: set lockUntil = now + 30 minutes
       ↓
Reset loginAttempts counter on success
       ↓
Return JWT + user object
```

---

## Password Reset Flow

```
User clicks "Forgot Password"
       ↓
POST /api/auth/forgot-password  { email }
       ↓
Always return 200 (prevents email enumeration)
       ↓
If user exists: generate reset token, send email
       ↓
User clicks link → /reset-password/<token>
       ↓
POST /api/auth/reset-password/:token  { password }
       ↓
validateResetPassword middleware
       ↓
Find user by hashed token where expiry > now
       ↓
Set new password (bcrypt hashes via pre-save), clear token, reset lockout
       ↓
Return new JWT (user is logged in)
```

---

## Email Validation Rules

| Rule | Implementation |
|---|---|
| Required field | Middleware + Mongoose |
| RFC-5321 format | Strict regex in middleware + Mongoose |
| Disposable domains | Blocklist of 30+ providers (mailinator, yopmail, etc.) |
| Uniqueness | MongoDB unique index + controller check |
| Lowercase + trimmed | Normalised before storage |

**Blocked domain examples:** mailinator.com, yopmail.com, guerrillamail.com, 10minutemail.com, trashmail.com, maildrop.cc, throwaway.email, getnada.com, fakeinbox.com, and 20+ more.

---

## Phone Number Validation Rules

| Rule | Implementation |
|---|---|
| Optional field | Allowed to be empty |
| Indian format only | Regex: `^(?:\+91\|0)?[6-9]\d{9}$` |
| Must start with 6, 7, 8 or 9 | Enforced by regex |
| Exactly 10 digits | Enforced by regex |
| No all-same-digit sequences | Regex: `^(\d)\1{9}$` |
| No known fake sequences | Blocklist: 1234567890, 9876543210, 1111111111, etc. |
| Prefix +91 or 0 accepted | Stripped before digit check |

---

## Password Strength Requirements

| Requirement | Rule |
|---|---|
| Minimum length | 8 characters |
| Uppercase letter | At least one A–Z |
| Lowercase letter | At least one a–z |
| Number | At least one 0–9 |
| Special character | Optional (adds to strength score) |

The frontend also shows a **4-bar strength indicator** (Weak / Fair / Good / Strong).

---

## Brute-Force Protection

- After **5 consecutive failed logins**, the account is locked for **30 minutes**
- Lock is automatically released after the 30-minute window
- The response tells the user how many attempts remain and how long until unlock
- Failed login messages are generic ("Invalid email or password") to prevent email enumeration

---

## Token Security

| Token | Algorithm | Storage | Expiry |
|---|---|---|---|
| JWT (session) | HMAC-SHA256, 64+ char secret | Client localStorage | 7 days |
| Email verification | crypto.randomBytes(32) → SHA-256 hash | MongoDB (hashed) | 24 hours |
| Password reset | crypto.randomBytes(32) → SHA-256 hash | MongoDB (hashed) | 1 hour |

Only the raw (unhashed) token is sent via email. The database stores the SHA-256 hash — even if the DB is compromised, tokens cannot be used without the raw value.

---

## SMTP / Email Setup (Gmail — Free)

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for "Mail → Other (ApnaGhar)"
4. Use the 16-character password as `SMTP_PASS` in your `.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="ApnaGhar <your_gmail@gmail.com>"
```

If SMTP is not configured (no `SMTP_USER`/`SMTP_PASS`), emails are silently skipped in development — the API still returns success so you can test without email.
