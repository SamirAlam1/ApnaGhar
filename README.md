# 🏡 ApnaGhar — AI-Powered Indian Real Estate Marketplace

India's smart property search platform — find, list, and discover verified properties across major Indian cities.

---

## 🚀 Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion       |
| Backend   | Node.js, Express.js, MongoDB (Mongoose)           |
| Auth      | JWT + bcrypt, Role-based (Buyer / Seller)         |
| i18n      | i18next — English, Hindi, Gujarati                |
| File Upload | Multer (local disk storage)                     |

---

## 📁 Project Structure

```
ApnaGhar/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # authController, propertyController
│   ├── middleware/     # JWT protect + role authorize
│   ├── models/         # User, Property, Review schemas
│   ├── routes/         # /api/auth, /api/properties
│   ├── utils/          # Standardized API response helpers
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/         # Static assets (logo.svg)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/       # ProtectedRoute
│   │   │   ├── layout/     # Navbar, HeroSection, Footer
│   │   │   ├── property/   # PropertyCard, SearchBar, Filters
│   │   │   └── ui/         # Skeleton loaders
│   │   ├── context/        # AuthContext, ThemeContext, WishlistContext
│   │   ├── i18n/           # EN, HI, GU translations
│   │   ├── layouts/        # MainLayout
│   │   ├── pages/          # All page components
│   │   ├── services/       # Axios API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json         # Root — concurrent dev scripts
└── README.md
```

---

## 🏠 Features

- **Hero Section** — Full-screen slideshow with Indian housing imagery
- **Property Listings** — Grid/list view with real-time API filtering
- **Advanced Filters** — City, type, BHK, budget, furnishing, RERA
- **Property Detail** — Image gallery, specs, amenities, seller contact
- **Authentication** — JWT-based login/register with Buyer / Seller roles
- **Protected Routes** — Role-based access for dashboard and listing
- **Seller Dashboard** — Real listings fetched from API, stats
- **Buyer Dashboard** — Wishlist, profile info
- **Wishlist** — Persisted in localStorage
- **Dark / Light Mode** — System preference aware, saved in localStorage
- **Multilingual** — English, Hindi (हिन्दी), Gujarati (ગુજરાતી) via i18next
- **Image Upload** — Multer-based file upload for property photos
- **RERA Badge** — Visual indicator for compliant properties
- **WhatsApp Integration** — Direct WhatsApp link from property detail
- **Share** — Web Share API with clipboard fallback

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/SamirAlam1/ApnaGhar.git
cd ApnaGhar
```

### 2. Install Dependencies

```bash
# Install root tools (concurrently)
npm install

# Install backend & frontend dependencies
npm run install:all
```

### 3. Configure Environment Variables

**Backend:**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/apnaghar
JWT_SECRET=your_very_long_random_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

> When deploying, set `VITE_API_URL` to your production API URL (e.g. Render).

### 4. Run in Development

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🗄️ MongoDB Schemas

### User
```
{ name, email, password (hashed), phone, role: 'buyer|seller|admin', avatar, isVerified, savedSearches }
```

### Property
```
{
  title, description, city, locality, address, pincode,
  price, listingType: 'sale|rent', propertyType: 'Flat|Villa|PG|Plot',
  bhk, bathrooms, area, furnishing, reraApproved, reraNumber,
  amenities[], images[], seller (ref: User),
  isActive, isFeatured, views, aiScore, tags[]
}
```

### Review
```
{ property (ref), user (ref), rating (1-5), comment }
```

---

## 🌐 API Endpoints

| Method | Endpoint                  | Auth        | Description            |
|--------|---------------------------|-------------|------------------------|
| POST   | /api/auth/register        | Public      | Register new user      |
| POST   | /api/auth/login           | Public      | Login                  |
| GET    | /api/auth/me              | Bearer JWT  | Get current profile    |
| GET    | /api/properties           | Public      | List with filters      |
| GET    | /api/properties/featured  | Public      | Featured listings      |
| GET    | /api/properties/mine      | Seller      | My listings            |
| GET    | /api/properties/:id       | Public      | Property detail        |
| POST   | /api/properties           | Seller      | Create listing         |
| PUT    | /api/properties/:id       | Seller      | Update listing         |
| DELETE | /api/properties/:id       | Seller      | Delete listing         |

### Query Parameters for GET /api/properties

| Param       | Type    | Description                                |
|-------------|---------|--------------------------------------------|
| city        | string  | Filter by city                             |
| type        | string  | Filter by property type (Flat/Villa/PG/Plot) |
| bhk         | number  | Filter by BHK count                       |
| furnishing  | string  | Furnished / Semi-Furnished / Unfurnished  |
| rera        | boolean | true = RERA approved only                 |
| minPrice    | number  | Minimum price                              |
| maxPrice    | number  | Maximum price                              |
| q           | string  | Full-text search                           |
| sort        | string  | price_asc / price_desc / newest / default  |
| page        | number  | Page number (default: 1)                   |
| limit       | number  | Results per page (default: 12, max: 50)    |

---

## 🚀 Deployment

### Frontend — Vercel

```bash
cd frontend && npm run build
# Connect GitHub repo to Vercel
# Build command: npm run build
# Output dir: dist
# Root dir: frontend
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://your-api.onrender.com/api
```

### Backend — Render

```
Build Command: npm install
Start Command: node server.js
Root Directory: backend
```

Set environment variables in Render dashboard:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_URL=https://your-app.vercel.app
```

---

## 🎨 Design Tokens

| Token         | Value       |
|---------------|-------------|
| Primary Blue  | `#1E40AF`   |
| Teal          | `#0D9488`   |
| Purple        | `#7C3AED`   |
| Charcoal      | `#1F2937`   |
| Display Font  | Playfair Display |
| Body Font     | DM Sans     |

---

## 📍 Supported Cities

Mumbai · Delhi · Bangalore · Ahmedabad · Vadodara

---

## 🗺️ Roadmap

- [ ] Cloudinary image uploads
- [ ] Google Maps property location embed
- [ ] Email verification (Nodemailer)
- [ ] EMI calculator widget
- [ ] Admin dashboard
- [ ] WhatsApp Business API
- [ ] Push notifications (PWA)
- [ ] AI property recommendation engine

---

Made with ❤️ in India 🇮🇳 | ApnaGhar © 2025
