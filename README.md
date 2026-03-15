# 🏡 ApnaGhar — Smart Indian Real Estate Marketplace

> India's trusted property search platform — Find your perfect home across top Indian cities.

[![Node](https://img.shields.io/badge/Node-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 📋 Project Description

ApnaGhar is a full-stack MERN real estate marketplace targeting the Indian market. It features smart property search, multi-language support (English, Hindi, Gujarati), RERA-verified listings, and a secure, production-ready authentication system.

---

## ✨ Features

| Category | Feature |
|---|---|
| Auth | Register / Login with email + password |
| Auth | Email verification via secure token (Nodemailer + Mailtrap SMTP) |
| Auth | Forgot / Reset password flow |
| Auth | Brute-force protection (account lockout after 5 failed attempts) |
| Auth | Disposable email domain blocking |
| Auth | Indian phone number format validation |
| Properties | Browse, filter, search listings |
| Properties | RERA-verified badge, furnishing status |
| Properties | Grid / list view |
| Search | Smart filters — BHK, budget, city, furnishing, amenities |
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
| Email | Nodemailer + Mailtrap SMTP |
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
│   │   ├── utils/validators.js
│   │   ├── services/api.js
│   │   ├── i18n/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── AUTHENTICATION.md
│   ├── API_DOCUMENTATION.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SECURITY.md
│   └── SETUP_GUIDE.md
│
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Mailtrap account (for email verification)

### 1. Clone

```bash
git clone https://github.com/SamirAlam1/ApnaGhar.git
cd ApnaGhar
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 4. Run development servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
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
| `CLIENT_URL` | Yes | Frontend URL (CORS + email links) |
| `SMTP_HOST` | Yes* | e.g. `live.smtp.mailtrap.io` |
| `SMTP_PORT` | Yes* | `587` |
| `SMTP_USER` | Yes* | `api` (Mailtrap) |
| `SMTP_PASS` | Yes* | Mailtrap API token |
| `EMAIL_FROM` | No | e.g. `ApnaGhar <hello@demomailtrap.co>` |

*Without SMTP config, verification emails are skipped in development.

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | e.g. `http://localhost:5000/api` |

---

## 🌐 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/verify-email/:token` | Public | Verify email |
| POST | `/api/auth/resend-verification` | Public | Resend verification email |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password/:token` | Public | Reset password |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/properties` | Public | List with filters |
| GET | `/api/properties/:id` | Public | Property detail |
| POST | `/api/properties` | Seller | Create listing |
| PUT | `/api/properties/:id` | Seller | Update listing |
| DELETE | `/api/properties/:id` | Seller | Delete listing |

---

## 🔒 Security Highlights

- bcrypt (12 rounds) password hashing
- JWT with 7-day expiry
- 5 failed logins → 30-min account lockout
- Rate limiting: 20 auth/15min, 5 registrations/hour per IP
- SHA-256 hashed email tokens (24hr expiry)
- 30+ disposable email domains blocked
- Indian phone validation with fake-sequence detection
- Input sanitisation (HTML stripping, null-byte removal)
- Helmet security headers
- CORS restricted to CLIENT_URL + `*.vercel.app`

---

## 🚀 Deployment

### Frontend → Vercel

```
Root Directory:   frontend
Framework:        Vite
Build Command:    node ./node_modules/vite/bin/vite.js build
Output Directory: dist
Env:              VITE_API_URL=https://apnaghar-backend.onrender.com/api
```

### Backend → Render

```
Root Directory: backend
Build Command:  npm install
Start Command:  node server.js
Env:            NODE_ENV, MONGO_URI, JWT_SECRET, CLIENT_URL, SMTP_*
```

---

## 🌐 Live Links

| | URL |
|---|---|
| 🌐 Frontend | https://apnaghar-finder.vercel.app |
| ⚙️ Backend | https://apnaghar-backend.onrender.com |
| ❤️ Health | https://apnaghar-backend.onrender.com/health |

---

Made with ❤️ in India 🇮🇳 | ApnaGhar © 2025
