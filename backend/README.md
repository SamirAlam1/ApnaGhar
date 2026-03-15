# 🖥️ ApnaGhar Backend

Node.js + Express REST API for the ApnaGhar real estate platform.

---

## Tech Stack

| Package            | Version | Purpose                          |
|--------------------|---------|----------------------------------|
| Node.js            | 18+     | Runtime                          |
| Express            | 4       | Web framework                    |
| MongoDB + Mongoose | 8       | Database + ODM                   |
| bcryptjs           | 2.4     | Password hashing (12 rounds)     |
| jsonwebtoken       | 9       | JWT auth tokens                  |
| Nodemailer         | 6.9     | Email sending (Mailtrap SMTP)    |
| Helmet             | 8       | Security HTTP headers            |
| express-rate-limit | 7       | Rate limiting + brute-force      |
| cors               | 2.8     | Cross-origin resource sharing    |
| morgan             | 1.10    | HTTP request logging (dev only)  |

---

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
node server.js
```

Server starts on `http://localhost:5000`

---

## Environment Variables

| Variable     | Required | Description                                        |
|--------------|----------|----------------------------------------------------|
| `MONGO_URI`  | Yes      | MongoDB connection string (Atlas or local)         |
| `JWT_SECRET` | Yes      | 64+ char random secret for signing JWTs            |
| `JWT_EXPIRE` | Yes      | Token expiry (e.g. `7d`)                           |
| `CLIENT_URL` | Yes      | Frontend URL for CORS + email links                |
| `SMTP_HOST`  | Yes      | SMTP host (e.g. `live.smtp.mailtrap.io`)           |
| `SMTP_PORT`  | Yes      | SMTP port (e.g. `587`)                             |
| `SMTP_USER`  | Yes      | SMTP username (e.g. `api` for Mailtrap)            |
| `SMTP_PASS`  | Yes      | SMTP password / API token                          |
| `EMAIL_FROM` | Yes      | Sender name + email (e.g. `ApnaGhar <hello@...>`) |
| `PORT`       | No       | Server port (default: `5000`)                      |
| `NODE_ENV`   | No       | `development` or `production`                      |

---

## API Endpoints

### Authentication

| Method | Route                             | Auth       | Description                   |
|--------|-----------------------------------|------------|-------------------------------|
| POST   | `/api/auth/register`              | Public     | Register + send verify email  |
| POST   | `/api/auth/login`                 | Public     | Login with JWT response       |
| GET    | `/api/auth/verify-email/:token`   | Public     | Verify email address          |
| POST   | `/api/auth/resend-verification`   | Public     | Resend verification email     |
| POST   | `/api/auth/forgot-password`       | Public     | Send password reset email     |
| POST   | `/api/auth/reset-password/:token` | Public     | Reset password                |
| GET    | `/api/auth/me`                    | Bearer JWT | Get current user profile      |

### Properties

| Method | Route                      | Auth   | Description       |
|--------|----------------------------|--------|-------------------|
| GET    | `/api/properties`          | Public | List with filters |
| GET    | `/api/properties/featured` | Public | Featured listings |
| GET    | `/api/properties/mine`     | Seller | My listings       |
| GET    | `/api/properties/:id`      | Public | Property detail   |
| POST   | `/api/properties`          | Seller | Create listing    |
| PUT    | `/api/properties/:id`      | Seller | Update listing    |
| DELETE | `/api/properties/:id`      | Seller | Delete listing    |

### Health Check

| Method | Route     | Description            |
|--------|-----------|------------------------|
| GET    | `/health` | Server + uptime status |

---

## Security Practices

| Feature                  | Implementation                                            |
|--------------------------|-----------------------------------------------------------|
| Input sanitisation       | HTML stripped, null bytes removed in `validate.js`        |
| Email validation         | Strict regex + 30+ disposable domains blocked             |
| Password policy          | Min 8 chars, uppercase + lowercase + digit required       |
| Phone validation         | Indian format regex + fake sequence blocklist             |
| Password hashing         | bcrypt with 12 salt rounds                                |
| Brute-force protection   | 5 failed logins → 30-min account lock                     |
| Email token security     | SHA-256 hashed tokens; raw token only sent in email       |
| JWT security             | Signed with 64+ char secret, 7-day expiry                 |
| Rate limiting (global)   | 300 requests / 15 min / IP                                |
| Rate limiting (auth)     | 20 requests / 15 min / IP                                 |
| Rate limiting (register) | 5 requests / hour / IP                                    |
| CORS                     | Restricted to `CLIENT_URL` + `*.vercel.app` preview URLs  |
| HTTP headers             | Helmet with strict CSP                                    |
| Trust proxy              | Enabled for Render reverse proxy                          |

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # register, login, verify, reset
│   └── propertyController.js  # CRUD for properties
├── middleware/
│   ├── auth.js                # JWT protect + role authorize
│   └── validate.js            # Input sanitisation + validation
├── models/
│   ├── User.js                # User schema with security fields
│   ├── Property.js            # Property schema
│   └── Review.js              # Review schema
├── routes/
│   ├── auth.js                # Auth routes with validate middleware
│   └── properties.js          # Property routes
├── utils/
│   ├── email.js               # Nodemailer Mailtrap SMTP sender
│   └── response.js            # sendSuccess / sendError helpers
├── server.js                  # Express app + middleware setup
├── package.json
└── .env.example
```

---

## Email System

Emails are sent via **Mailtrap SMTP** using Nodemailer:

| Email Type         | Trigger                    | Content               |
|--------------------|----------------------------|-----------------------|
| Verification Email | On register                | Verify button + link  |
| Welcome Email      | After email verified       | Welcome message       |
| Password Reset     | On forgot-password request | Reset button + link   |

All emails use responsive HTML templates with ApnaGhar branding.

---

## Deployment (Render)

1. Root Directory: `backend`
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Set all environment variables in Render Dashboard
5. Health check URL: `https://apnaghar-backend.onrender.com/health`
