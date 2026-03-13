# 🖥️ ApnaGhar Backend

Node.js + Express REST API for the ApnaGhar real estate platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt (12 rounds)
- **Email:** Nodemailer + Gmail SMTP (free)
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** Custom middleware (no external validation library)

---

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

Server starts on `http://localhost:5000`

---

## Environment Variables

See `.env.example` for all variables. Required:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | 64+ char random secret for signing JWTs |
| `CLIENT_URL` | Frontend URL for CORS + email links |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password (16 chars, from Google Account Security) |

---

## API Endpoints

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user (email verified via link) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get profile (JWT required) |

### Properties

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/properties` | Public | List with filters |
| GET | `/api/properties/featured` | Public | Featured listings |
| GET | `/api/properties/mine` | Seller | My listings |
| GET | `/api/properties/:id` | Public | Property detail |
| POST | `/api/properties` | Seller | Create listing |
| PUT | `/api/properties/:id` | Seller | Update listing |
| DELETE | `/api/properties/:id` | Seller | Delete listing |

See `../docs/API_DOCUMENTATION.md` for full request/response schemas.

---

## Security Practices

- All inputs sanitised (HTML stripped, null bytes removed) in `middleware/validate.js`
- Email format validated with strict regex; 30+ disposable domains blocked
- Passwords require 8+ chars, uppercase, lowercase, digit
- Phone numbers validated for Indian format; fake sequences blocked
- Brute-force protection: 5 failed logins → 30-min account lock
- Email verification tokens hashed with SHA-256 (raw token sent only in email)
- Rate limiting: 20 auth requests / 15 min / IP; 5 registrations / hour / IP
- Helmet headers, CORS restricted to CLIENT_URL

See `../docs/SECURITY.md` for full details.

---

## Folder Structure

```
backend/
├── controllers/
│   ├── authController.js     # Auth business logic
│   └── propertyController.js
├── middleware/
│   ├── auth.js               # JWT protect + authorize
│   └── validate.js           # Input sanitisation + validation
├── models/
│   ├── User.js               # User schema with validators
│   ├── Property.js
│   └── Review.js
├── routes/
│   ├── auth.js               # Auth routes (with validate middleware)
│   └── properties.js
├── utils/
│   ├── email.js              # Nodemailer Gmail SMTP sender
│   └── response.js           # sendSuccess / sendError
├── config/
│   └── db.js                 # MongoDB connect
├── server.js
├── package.json
└── .env.example
```