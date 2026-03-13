# 🛡️ Security Documentation — ApnaGhar

## Security Architecture Overview

```
Client (React)
  │
  ├── Input validation (validators.js) — client-side, instant feedback
  ├── HTTPS (production)
  │
  ↓
Express Server
  │
  ├── Helmet — security HTTP headers
  ├── CORS — restricted to CLIENT_URL
  ├── Rate Limiter — global + per-auth-route
  │
  ├── validateRegister / validateLogin middleware
  │     ├── Input sanitisation (strip HTML, null bytes)
  │     ├── Email format + disposable-domain check
  │     ├── Password strength enforcement
  │     └── Phone number validation (Indian format + fake-sequence detection)
  │
  ├── authController
  │     ├── Brute-force protection (5 attempts → 30-min lock)
  │     ├── Generic error messages (prevent user enumeration)
  │     ├── Email verification token flow (SHA-256 hashed)
  │     └── Password reset token flow (SHA-256 hashed)
  │
  └── Mongoose User model
        ├── bcrypt (12 rounds) — password hashing
        ├── Regex validators on email + name
        ├── Phone validator (Indian format + fake-sequence blocklist)
        └── Sensitive fields excluded from JSON output
```

---

## Input Sanitisation

Every string input is processed before reaching controller logic:

```javascript
function sanitizeString(str) {
  return str
    .replace(/<[^>]*>/g, '')  // strip all HTML tags → XSS prevention
    .replace(/\0/g, '')       // strip null bytes → injection prevention
    .trim();
}
```

This prevents:
- Cross-Site Scripting (XSS) via stored user input
- Null-byte injection attacks
- Leading/trailing whitespace inconsistencies

---

## Password Security

- **Hashing:** bcrypt with **12 salt rounds** (≈250ms per hash — strong brute-force resistance)
- **Minimum strength:** 8+ characters, uppercase, lowercase, digit
- **Never stored in plaintext**
- **Never returned in API responses** (`select: false` on Mongoose schema)
- **Not logged** anywhere in the codebase

---

## JWT Security

| Property | Value |
|---|---|
| Algorithm | HS256 (HMAC-SHA256) |
| Secret | Min 64 random bytes (env var) |
| Expiry | 7 days |
| Storage | Client localStorage |
| Transport | `Authorization: Bearer <token>` header only |

The secret is loaded from `JWT_SECRET` environment variable and never hardcoded.

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Email Verification Token Security

```
Raw token = crypto.randomBytes(32)  →  64-char hex string (sent in email)
DB token  = SHA-256(raw_token)      →  stored in MongoDB
```

This means:
- Even if the database is leaked, tokens cannot be used (attacker needs the raw token from the email)
- Tokens expire in 24 hours
- Tokens are one-time-use (cleared after verification)

Same pattern used for password reset tokens (1-hour expiry).

---

## Brute-Force Protection

The account lockout system works at the **user account level** (not just IP):

```
Failed login attempt #1 → loginAttempts = 1
Failed login attempt #2 → loginAttempts = 2
Failed login attempt #3 → loginAttempts = 3
Failed login attempt #4 → loginAttempts = 4
Failed login attempt #5 → lockUntil = now + 30 minutes

All login attempts while locked → 423 response with minutes remaining

After 30 minutes → lock expires, counter resets on next attempt
Successful login → counter reset to 0
```

Rate limiting at the IP level adds a second layer:
- Auth routes: 20 requests per 15 minutes per IP
- Register: 5 requests per hour per IP

---

## Disposable Email Blocking

The following domains are blocked at registration:

```
mailinator.com, guerrillamail.com, throwam.com, tempmail.com,
trashmail.com, yopmail.com, sharklasers.com, spam4.me,
dispostable.com, mailnull.com, maildrop.cc, discard.email,
fakeinbox.com, throwaway.email, getnada.com, filzmail.com,
getairmail.com, 10minutemail.com, minutemail.com, tempinbox.com,
guerrillamail.info, guerrillamail.biz, guerrillamail.de,
guerrillamail.net, guerrillamail.org, grr.la
```

New domains can be added to the `BLOCKED_DOMAINS` array in both `backend/middleware/validate.js` and `frontend/src/utils/validators.js`.

---

## Phone Number Validation

Valid Indian mobile numbers only:

- Must be 10 digits
- Must start with 6, 7, 8, or 9
- Optional prefix: `+91` or `0`
- Regex: `^(?:\+91|0)?[6-9]\d{9}$`

Blocked fake sequences:
```
1234567890, 9876543210, 0123456789, 1111111111, 2222222222,
3333333333, 4444444444, 5555555555, 6666666666, 7777777777,
8888888888, 9999999999, 0000000000, 1234512345, 9999900000
```

All-same-digit patterns (`(\d)\1{9}`) are also blocked.

---

## HTTP Security Headers (Helmet)

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `0` (modern browsers use CSP) |
| `Strict-Transport-Security` | `max-age=15552000` (production) |
| `Content-Security-Policy` | `default-src 'self'` (restrictive) |
| `Cross-Origin-Resource-Policy` | `cross-origin` (for uploaded images) |

---

## CORS Policy

Only the origin(s) listed in `CLIENT_URL` environment variable are allowed. Multiple origins can be comma-separated:

```env
CLIENT_URL=https://apnaghar.vercel.app,https://www.apnaghar.in
```

---

## User Enumeration Prevention

- **Login:** Generic "Invalid email or password" — does not reveal whether the email exists
- **Forgot password:** Always returns 200 regardless of whether email is registered
- **Resend verification:** Always returns 200 regardless of email status

---

## Sensitive Field Exclusion

The following fields are **never** returned in API responses:

```javascript
// In User.methods.toJSON():
delete obj.password
delete obj.emailVerificationToken
delete obj.emailVerificationExpires
delete obj.passwordResetToken
delete obj.passwordResetExpires
delete obj.loginAttempts
delete obj.lockUntil
```

Additionally, `password` has `select: false` in Mongoose, so it is not included in any query by default unless explicitly requested.

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET` (64+ random bytes)
- [ ] Configure MongoDB Atlas with IP allowlist
- [ ] Enable HTTPS on the backend server
- [ ] Set `CLIENT_URL` to exact production frontend URL
- [ ] Configure Gmail App Password for SMTP
- [ ] Set up MongoDB backup schedule
- [ ] Review rate limit values for expected traffic
- [ ] Monitor failed login attempts and lockout events
