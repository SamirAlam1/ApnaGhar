# 📡 API Documentation — ApnaGhar

Base URL: `http://localhost:5000/api` (development)

All responses follow this structure:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }        // present on success
}
```

Error responses include an optional `errors` object for field-level validation errors:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Please provide a valid email address",
    "phone": "Enter a valid 10-digit Indian mobile number"
  }
}
```

---

## Authentication Endpoints

### POST `/api/auth/register`

Register a new user account.

**Request body:**

```json
{
  "name":     "Ravi Sharma",
  "email":    "ravi@example.com",
  "password": "SecurePass123",
  "phone":    "9876543210",
  "role":     "buyer"
}
```

**Validation rules:**

| Field | Rules |
|---|---|
| name | Required, 2–60 chars, letters + spaces only (EN/HI/GU) |
| email | Required, valid format, not a disposable domain, unique |
| password | Required, 8+ chars, uppercase, lowercase, digit |
| phone | Optional, valid Indian mobile (6–9 prefix, 10 digits, not fake) |
| role | Optional, `buyer` or `seller` (default: `buyer`) |

**Success response (201):**

```json
{
  "success": true,
  "message": "Account created! Please check your email to verify your account.",
  "data": {
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Ravi Sharma", "email": "ravi@example.com", "role": "buyer", "isEmailVerified": false },
    "emailVerificationRequired": true
  }
}
```

**Error responses:** 400 (validation), 409 (email exists), 500 (server error)

---

### POST `/api/auth/login`

Login with email + password.

**Request body:**

```json
{
  "email":    "ravi@example.com",
  "password": "SecurePass123"
}
```

**Success response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": { "_id": "...", "name": "Ravi Sharma", "email": "ravi@example.com", "role": "buyer" }
  }
}
```

**Error responses:**
- 400: Validation failed (field-level errors)
- 401: Invalid email or password (+ attempts remaining hint)
- 423: Account locked (+ minutes remaining)
- 500: Server error

---

### GET `/api/auth/verify-email/:token`

Verify email address using the token from the verification email.

**URL params:** `token` — raw 64-hex-char token

**Success response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully! Your account is now fully active.",
  "data": { "user": { ... } }
}
```

**Error responses:** 400 (invalid/expired token)

---

### POST `/api/auth/resend-verification`

Resend email verification link.

**Request body:** `{ "email": "ravi@example.com" }`

**Response (always 200 to prevent enumeration):**

```json
{ "success": true, "message": "If this email is registered and unverified, a new link has been sent." }
```

---

### POST `/api/auth/forgot-password`

Request a password reset link via email.

**Request body:** `{ "email": "ravi@example.com" }`

**Response (always 200 to prevent enumeration):**

```json
{ "success": true, "message": "If this email is registered, a reset link has been sent." }
```

---

### POST `/api/auth/reset-password/:token`

Set a new password using the reset token from the email.

**URL params:** `token` — raw 64-hex-char token

**Request body:**

```json
{ "password": "NewSecurePass456" }
```

**Success response (200):**

```json
{
  "success": true,
  "message": "Password reset successful. You are now logged in.",
  "data": { "token": "<jwt>", "user": { ... } }
}
```

**Error responses:** 400 (invalid/expired token), 400 (weak password)

---

### GET `/api/auth/me`

Get the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <jwt>`

**Success response (200):**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": { "user": { "_id": "...", "name": "...", "email": "...", "role": "...", "isEmailVerified": true } }
}
```

**Error responses:** 401 (no token / invalid token)

---

## Property Endpoints

### GET `/api/properties`

List properties with optional filters.

**Query params:** `city`, `type` (sale/rent), `minPrice`, `maxPrice`, `bhk`, `rera` (true/false), `page`, `limit`

**Response:** Paginated array of property objects.

---

### GET `/api/properties/featured`

Get featured property listings.

---

### GET `/api/properties/:id`

Get a single property by ID.

---

### GET `/api/properties/mine`

Get the authenticated seller's own listings.

**Headers:** `Authorization: Bearer <jwt>` (Seller role required)

---

### POST `/api/properties`

Create a new property listing.

**Headers:** `Authorization: Bearer <jwt>` (Seller role required)

---

### PUT `/api/properties/:id`

Update a property listing.

**Headers:** `Authorization: Bearer <jwt>` (Seller, own listing only)

---

### DELETE `/api/properties/:id`

Delete a property listing.

**Headers:** `Authorization: Bearer <jwt>` (Seller, own listing only)

---

## Rate Limits

| Route | Limit |
|---|---|
| All API routes | 300 requests / 15 min per IP |
| All auth routes | 20 requests / 15 min per IP |
| Register only | 5 requests / 1 hour per IP |

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (bad credentials / no token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (e.g. duplicate email) |
| 423 | Locked (account locked after too many failed logins) |
| 429 | Too Many Requests (rate limit hit) |
| 500 | Internal Server Error |
