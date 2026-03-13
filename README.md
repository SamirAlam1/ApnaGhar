# 🏡 ApnaGhar — AI-Powered Indian Real Estate Marketplace

> India's smartest property search platform — Powered by AI, trusted by 50,000+ families.

[![Node](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 📋 Project Description

ApnaGhar is a full-stack MERN real estate marketplace targeting the Indian market. It features AI-powered property recommendations, multi-language support (English, Hindi, Gujarati), RERA-verified listings, and a secure, production-ready authentication system.

---

## ✨ Features

| Category | Feature |
|---|---|
| Auth | Register / Login with email + password |
| Auth | Email verification via secure token (Nodemailer + Gmail SMTP) |
| Auth | Forgot / Reset password flow |
| Auth | Brute-force protection (account lockout after 5 failed attempts) |
| Auth | Disposable email domain blocking |
| Auth | Indian phone number format validation |
| Properties | Browse, filter, search listings |
| Properties | RERA-verified badge, furnishing status |
| Properties | Grid / list view |
| AI | Smart search, AI property recommendations |
| i18n | English, Hindi (हिन्दी), Gujarati (ગુજરાતી) |
| UI | Dark / Light mode, Framer Motion animations |
| Security | JWT auth, Helmet, rate limiting, input sanitisation |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js 18+, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcrypt (12 rounds) |
| Email | Nodemailer + Gmail SMTP (free) |
| Security | Helmet, express-rate-limit, input validation |
| i18n | i18next (EN / HI / GU) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
ApnaGhar/
├── backend/                   # Node + Express API
│   ├── controllers/
│   │   └── authController.js  # register, login, verify-email, forgot/reset password
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + authorize
│   │   └── validate.js        # Input validation + sanitisation middleware
│   ├── models/
│   │   ├── User.js            # User schema with validation
│   │   ├── Property.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── properties.js
│   ├── utils/
│   │   ├── email.js           # Nodemailer email sender
│   │   └── response.js        # Standardised API responses
│   ├── config/db.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                  # Vite + React
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/ProtectedRoute.jsx
│   │   │   ├── layout/        # Navbar, HeroSection, Footer
│   │   │   ├── property/      # PropertyCard, SearchBar, Filters
│   │   │   └── ui/            # Skeleton loaders
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── VerifyEmailPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── validators.js  # Client-side validation (mirrors backend)
│   │   ├── services/api.js
│   │   ├── i18n/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── README.md
│
├── docs/                      # Detailed documentation
│   ├── AUTHENTICATION.md
│   ├── API_DOCUMENTATION.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SECURITY.md
│   └── SETUP_GUIDE.md
│
└── README.md                  # ← You are here
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for email verification)

### 1. Clone

```bash
git clone https://github.com/SamirAlam1/ApnaGhar.git
cd ApnaGhar
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env
```

### 4. Run development servers

```bash
# Backend (http://localhost:5000)
cd backend && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Min 64-char random string |
| `JWT_EXPIRE` | No | Token lifetime (default: 7d) |
| `CLIENT_URL` | Yes | Frontend URL (for CORS + email links) |
| `SMTP_HOST` | Yes* | SMTP host (e.g. smtp.gmail.com) |
| `SMTP_PORT` | Yes* | SMTP port (587 for TLS) |
| `SMTP_USER` | Yes* | Gmail address |
| `SMTP_PASS` | Yes* | Gmail App Password |
| `EMAIL_FROM` | No | Sender display name + email |

*Required for email verification. Without SMTP config, verification emails are skipped (development mode).

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API URL (e.g. http://localhost:5000/api) |

---

## 🌐 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/verify-email/:token` | Public | Verify email address |
| POST | `/api/auth/resend-verification` | Public | Resend verification email |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password/:token` | Public | Reset password |
| GET | `/api/auth/me` | Bearer JWT | Get current user profile |
| GET | `/api/properties` | Public | List properties with filters |
| GET | `/api/properties/:id` | Public | Property detail |
| POST | `/api/properties` | Seller JWT | Create listing |
| PUT | `/api/properties/:id` | Seller JWT | Update listing |
| DELETE | `/api/properties/:id` | Seller JWT | Delete listing |

See `docs/API_DOCUMENTATION.md` for full request/response schemas.

---

## 🔒 Security Highlights

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- Brute-force protection: 5 failed logins → 30-min account lock
- Rate limiting: 20 auth requests / 15 min, 5 registrations / hour per IP
- Email verification via SHA-256 hashed tokens (24-hour expiry)
- Disposable email domains blocked (30+ providers)
- Indian phone number validation with fake-sequence detection
- Input sanitisation (HTML tag stripping, null-byte removal)
- Helmet security headers
- CORS restricted to configured client URL

See `docs/SECURITY.md` for details.

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd frontend && npm run build
# Connect GitHub repo to Vercel
# Set: VITE_API_URL=https://your-api.onrender.com/api
```

### Backend → Render

```
Build Command: npm install
Start Command: node server.js
Environment Variables: NODE_ENV, MONGO_URI, JWT_SECRET, CLIENT_URL, SMTP_*
```

---

Made with ❤️ in India 🇮🇳 | ApnaGhar © 2025