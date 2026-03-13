# ⚙️ Setup Guide — ApnaGhar

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.0.0 | `node --version` to check |
| npm | 9.0.0 | comes with Node |
| MongoDB | 6.0+ | local or Atlas |
| Git | any | to clone the repo |
| Gmail account | — | for email verification (free SMTP) |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/SamirAlam1/ApnaGhar.git
cd ApnaGhar
```

---

## Step 2 — Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 3 — MongoDB Setup

### Option A: Local MongoDB

```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongod   # Linux
brew services start mongodb-community  # macOS

# Your MONGO_URI will be:
MONGO_URI=mongodb://localhost:27017/apnaghar
```

### Option B: MongoDB Atlas (Free Tier — Recommended)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account → New Project → Build a Cluster (Free M0)
3. Create a database user (username + password)
4. Add your IP to the allowlist (or 0.0.0.0/0 for dev)
5. Click "Connect" → "Connect your application" → copy the URI
6. Replace `<password>` with your DB user password

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/apnaghar
```

---

## Step 4 — Gmail App Password (Free SMTP)

Email verification uses Nodemailer with Gmail SMTP — completely free.

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required for App Passwords)
3. Go to **Security → App Passwords**
4. Select **Mail** → **Other (Custom name)** → Type "ApnaGhar" → **Generate**
5. Copy the 16-character password shown

> **Important:** Use this App Password in `SMTP_PASS`, NOT your real Gmail password.

---

## Step 5 — Configure Environment Variables

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/apnaghar
JWT_SECRET=generate_a_64_char_random_string_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM="ApnaGhar <your_gmail@gmail.com>"
```

Generate JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend

```bash
cd frontend
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 6 — Run Development Servers

Open **two terminal windows**:

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

---

## Step 7 — Verify Everything Works

1. Open http://localhost:5173
2. Click "Register" and create an account
3. Check your Gmail inbox for a verification email
4. Click the verification link → should show "Email Verified!" screen
5. Login with your credentials

### Test the API directly:

```bash
# Health check
curl http://localhost:5000/health

# Register (should return 201 + emailVerificationRequired: true)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@gmail.com","password":"SecurePass123","role":"buyer"}'

# Try a disposable email (should return 400)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@mailinator.com","password":"SecurePass123"}'

# Try a fake phone (should return 400)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"valid@gmail.com","password":"SecurePass123","phone":"1234567890"}'
```

---

## Production Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
```

1. Push your repo to GitHub
2. Connect at [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-api.onrender.com/api`
5. Deploy

### Backend → Render (Free Tier)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add all environment variables from `backend/.env`
5. Deploy

---

## Troubleshooting

**SMTP connection refused:**
- Check that `SMTP_PORT=587` (not 465 unless you set `secure: true`)
- Ensure your Gmail has 2FA enabled before creating App Password
- Verify the App Password has no spaces when pasted

**MongoDB connection failed:**
- Check that MongoDB is running locally: `sudo systemctl status mongod`
- For Atlas: verify your IP is in the allowlist

**CORS error in browser:**
- Ensure `CLIENT_URL` in backend `.env` matches exactly `http://localhost:5173`
- Restart the backend server after changing `.env`

**"Token is invalid or has expired":**
- JWT_SECRET must be the same value the token was signed with
- Do not change JWT_SECRET after users have logged in

**Email not received:**
- Check spam/promotions folder
- Verify SMTP credentials in `.env`
- In dev without SMTP configured, emails are silently skipped — check server logs
