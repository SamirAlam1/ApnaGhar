# 🎨 ApnaGhar Frontend

React 18 + Vite single-page application for the ApnaGhar real estate platform.

## Tech Stack

- **Framework:** React 18
- **Build tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Animations:** Framer Motion
- **Routing:** React Router DOM 6
- **HTTP:** Axios
- **i18n:** i18next (EN / HI / GU)
- **Toasts:** react-hot-toast

---

## Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# App available at http://localhost:5173
```

---

## Build

```bash
npm run build
# Output in dist/
```

Preview production build:

```bash
npm run preview
```

---

## Folder Structure

```
frontend/src/
│
├── App.jsx                    # Routes
├── main.jsx                   # React entry point
├── index.css                  # Tailwind + global styles
│
├── utils/
│   └── validators.js          # Email, password, phone, name validators
│
├── context/
│   ├── AuthContext.jsx        # Auth state + API calls
│   ├── ThemeContext.jsx       # Dark/light mode
│   └── WishlistContext.jsx    # Wishlist state
│
├── pages/
│   ├── AuthPage.jsx           # Login + register form
│   ├── VerifyEmailPage.jsx    # /verify-email/:token
│   ├── ForgotPasswordPage.jsx # /forgot-password
│   ├── ResetPasswordPage.jsx  # /reset-password/:token
│   ├── HomePage.jsx
│   ├── PropertiesPage.jsx
│   ├── PropertyDetailPage.jsx
│   ├── DashboardPage.jsx
│   ├── WishlistPage.jsx
│   ├── ListPropertyPage.jsx
│   └── NotFoundPage.jsx
│
├── components/
│   ├── auth/ProtectedRoute.jsx
│   ├── layout/               # Navbar, HeroSection, Footer
│   ├── property/             # PropertyCard, SearchBar, Filters
│   └── ui/                   # Skeleton loaders
│
├── layouts/
│   └── MainLayout.jsx
│
├── services/
│   └── api.js                # Axios instance + service methods
│
└── i18n/
    └── index.js              # Translation strings (EN/HI/GU)
```

---

## Authentication Flow (Frontend)

1. **Register** → `AuthPage` (mode="register")
   - Real-time validation as user types (after field is touched)
   - Submit button disabled until form is fully valid
   - After success → shows "Check your inbox" banner

2. **Verify Email** → `VerifyEmailPage` (`/verify-email/:token`)
   - Auto-calls API on mount, shows success/error state

3. **Login** → `AuthPage` (mode="login")
   - Shows remaining login attempts on failure
   - Shows lockout duration if account is locked

4. **Forgot Password** → `ForgotPasswordPage` (`/forgot-password`)
   - Always shows success message (prevents enumeration)

5. **Reset Password** → `ResetPasswordPage` (`/reset-password/:token`)
   - Password strength indicator
   - Confirms match before submit

---

## Validation (validators.js)

All validation rules match the backend exactly:

| Rule | Frontend | Backend |
|---|---|---|
| Email format | RFC-5321 regex | Same regex |
| Disposable domains | 30+ blocked | Same list |
| Password strength | 8+ chars, upper+lower+digit | Same |
| Phone format | Indian regex + fake-sequence blocklist | Same |
| Name | Letters + spaces (EN/HI/GU), 2–60 chars | Same |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |