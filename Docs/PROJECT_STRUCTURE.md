# 📁 Project Structure — ApnaGhar

```
ApnaGhar/
│
├── README.md                          # Root project overview
├── package.json                       # Root (optional monorepo scripts)
├── .gitignore
│
├── backend/                           # Node.js + Express API
│   │
│   ├── server.js                      # App entry point, middleware setup, routes
│   ├── package.json                   # Backend dependencies (includes nodemailer)
│   ├── .env.example                   # Environment variable template
│   │
│   ├── config/
│   │   └── db.js                      # MongoDB connection (Mongoose)
│   │
│   ├── controllers/
│   │   ├── authController.js          # ★ MODIFIED — register, login, verify-email,
│   │   │                              #   resend-verification, forgot/reset password
│   │   └── propertyController.js      # CRUD for property listings
│   │
│   ├── middleware/
│   │   ├── auth.js                    # JWT protect + role-based authorize
│   │   └── validate.js                # ★ NEW — input sanitisation + validation
│   │
│   ├── models/
│   │   ├── User.js                    # ★ MODIFIED — strong validation, verification
│   │   │                              #   tokens, lockout fields, phone validation
│   │   ├── Property.js                # Property schema
│   │   └── Review.js                  # Review schema
│   │
│   ├── routes/
│   │   ├── auth.js                    # ★ MODIFIED — added new auth routes
│   │   └── properties.js              # Property CRUD routes
│   │
│   └── utils/
│       ├── email.js                   # ★ NEW — Nodemailer email sender (Gmail SMTP)
│       └── response.js                # sendSuccess / sendError helpers
│
├── frontend/                          # Vite + React 18
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   │
│   └── src/
│       │
│       ├── App.jsx                    # ★ MODIFIED — added new page routes
│       ├── main.jsx                   # React entry point
│       ├── index.css                  # Global styles + Tailwind
│       │
│       ├── utils/
│       │   └── validators.js          # ★ NEW — client-side validation (mirrors backend)
│       │
│       ├── context/
│       │   ├── AuthContext.jsx        # ★ MODIFIED — added resendVerification,
│       │   │                          #   forgotPassword, resetPassword methods
│       │   ├── ThemeContext.jsx       # Dark/light mode
│       │   └── WishlistContext.jsx    # Wishlist state
│       │
│       ├── pages/
│       │   ├── AuthPage.jsx           # ★ REWRITTEN — full validation, strength meter,
│       │   │                          #   phone validation, verification banner
│       │   ├── VerifyEmailPage.jsx    # ★ NEW — email verification token handler
│       │   ├── ForgotPasswordPage.jsx # ★ NEW — forgot password request form
│       │   ├── ResetPasswordPage.jsx  # ★ NEW — password reset form
│       │   ├── HomePage.jsx
│       │   ├── PropertiesPage.jsx
│       │   ├── PropertyDetailPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── WishlistPage.jsx
│       │   ├── ListPropertyPage.jsx
│       │   └── NotFoundPage.jsx
│       │
│       ├── components/
│       │   ├── auth/
│       │   │   └── ProtectedRoute.jsx
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── HeroSection.jsx
│       │   │   └── Footer.jsx
│       │   ├── property/
│       │   │   ├── PropertyCard.jsx
│       │   │   ├── PropertyFilters.jsx
│       │   │   └── SearchBar.jsx
│       │   └── ui/
│       │       └── Skeleton.jsx
│       │
│       ├── layouts/
│       │   └── MainLayout.jsx
│       │
│       ├── services/
│       │   └── api.js                 # Axios instance + property/auth service
│       │
│       └── i18n/
│           └── index.js               # EN / HI / GU translations
│
└── docs/                              # ★ NEW — Project documentation
    ├── README.md
    ├── AUTHENTICATION.md              # Auth flow, validation rules, email setup
    ├── API_DOCUMENTATION.md           # All API endpoints with request/response examples
    ├── PROJECT_STRUCTURE.md           # ← You are here
    ├── SECURITY.md                    # Security architecture, production checklist
    └── SETUP_GUIDE.md                 # Step-by-step development + deployment guide
```

---

## Key File Roles

### Backend

| File | Role |
|---|---|
| `server.js` | Express app setup, security middleware, route mounting |
| `middleware/validate.js` | Sanitise + validate ALL auth inputs before controller |
| `middleware/auth.js` | Verify JWT, attach user to `req.user`, role-check |
| `controllers/authController.js` | Business logic for all auth flows |
| `models/User.js` | Mongoose schema with built-in validation + token methods |
| `utils/email.js` | Nodemailer transporter + HTML email templates |
| `utils/response.js` | `sendSuccess()` and `sendError()` wrappers |

### Frontend

| File | Role |
|---|---|
| `utils/validators.js` | Reusable validation functions — email, password, phone, name |
| `context/AuthContext.jsx` | Global auth state + API calls for all auth operations |
| `pages/AuthPage.jsx` | Login/register form with real-time validation + UX |
| `pages/VerifyEmailPage.jsx` | Handles `/verify-email/:token` route |
| `pages/ForgotPasswordPage.jsx` | Request password reset by email |
| `pages/ResetPasswordPage.jsx` | Set new password via reset token |
| `App.jsx` | Route definitions including all new auth pages |

---

## Data Flow: Registration

```
AuthPage (form)
  └─→ validateRegisterForm (validators.js)    ← instant client validation
       └─→ POST /api/auth/register
            └─→ validateRegister middleware    ← server sanitisation + validation
                 └─→ authController.register
                      ├─→ User.findOne (check uniqueness)
                      ├─→ User.create (bcrypt hashes password in pre-save hook)
                      ├─→ user.generateEmailVerificationToken()
                      ├─→ user.save()
                      ├─→ sendVerificationEmail() (Nodemailer)
                      └─→ sendSuccess(201, token, user, emailVerificationRequired: true)
```
