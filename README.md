# BarberElite — Full-Stack Barber Appointment System

A production-ready barber appointment booking system with **React + Tailwind CSS** frontend, **Node.js + Express** backend, **MongoDB** database, and **JWT authentication**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Charts | Recharts |
| Icons | React Icons |
| Notifications | React Hot Toast |

---

## 🗂️ Project Structure

```
barber-appointment-system/
├── backend/          # Node.js + Express REST API
│   ├── config/       # DB connection
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth + error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── utils/        # Token generator
│   ├── seeder.js     # Seed data script
│   └── server.js     # App entry point
│
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── api/          # Axios client
        ├── components/   # Reusable UI components
        ├── context/      # Auth context
        ├── hooks/        # Custom React hooks
        └── pages/        # Route-level components
```

---

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Register, browse barbers & services, book appointments, cancel, leave reviews |
| **Barber** | View schedule, confirm/complete/cancel appointments, manage availability |
| **Admin** | Full dashboard, manage users/barbers/services, view analytics & revenue |

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### 1. Clone & Setup Backend

```bash
cd barber-appointment-system/backend
npm install
```

Edit `.env` if using MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/barber-db
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Setup Frontend

```bash
cd barber-appointment-system/frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@barbershop.com | admin123 |
| Barber | jawed@barbershop.com | barber123 |
| Customer | customer@example.com | customer123 |
> 💡 The Login page has **one-click demo buttons** to fill credentials automatically!

---

## 💳 Payment System
- **Razorpay Integration:** Secure online card, UPI, and NetBanking payments.
- **Cash Option:** Customers can opt to pay with cash at the salon.
- **Verification:** Cryptographic signature verification checks are performed natively.
- **Simulation Mode:** If no environment credentials are set, the booking system automatically switches to a beautiful **Simulated Checkout Sandbox** for seamless local testing.

---

## 🔒 Security Features
- **Rate Limiting:** Protects backend endpoints against brute force attacks natively (300 requests per 15 mins per IP).
- **Helmet Headers:** Native HTTP security headers (nosniff, clickjacking frame prevention, Content Security Policies).
- **XSS Sanitizer:** Pre-processes `req.body`, `req.query`, and `req.params` inputs to sanitize and strip executable HTML/script tags.

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Authenticate user |
| GET | `/api/auth/profile` | Auth | Get current user |
| PUT | `/api/auth/profile` | Auth | Update profile details |
| GET | `/api/barbers` | Public | List & search barbers |
| GET | `/api/barbers/:id` | Public | Get barber profile + reviews |
| PUT | `/api/barbers/profile` | Barber | Update detailed profile |
| GET | `/api/barbers/:id/slots?date=` | Public | Fetch available slots |
| PUT | `/api/barbers/availability` | Barber | Toggle schedule availability |
| GET | `/api/services` | Public | List services |
| POST/PUT/DELETE | `/api/services/:id` | Admin | Manage services |
| POST | `/api/appointments` | Customer | Book appointment (supports online verification) |
| GET | `/api/appointments/my` | Customer | Fetch customer appointments list |
| GET | `/api/appointments/barber` | Barber | Fetch barber appointments list |
| PUT | `/api/appointments/:id/status` | Barber/Customer/Admin | Cancel/complete booking |
| POST | `/api/appointments/:id/review` | Customer | Leave completed booking review |
| GET | `/api/notifications` | Auth | Fetch notification center items |
| PUT | `/api/notifications/read` | Auth | Mark all notifications read |
| POST | `/api/payments/order` | Customer | Create Razorpay order ID |
| GET | `/api/admin/stats` | Admin | Dashboard operations overview |
| GET | `/api/admin/users` | Admin | Manage user accounts |
| DELETE | `/api/admin/users/:id` | Admin | Remove customer or barber |

---

## 🔧 Environment Configuration

### Backend Setup (`backend/.env`)
Add the following keys to your backend `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/barber-elite
JWT_SECRET=supersecurejwtsecretkey
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### Frontend Setup (`frontend/.env`)
Create a `.env` file in your `frontend` directory and add:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## 📋 Seeder Commands

```bash
npm run seed              # Populate database
npm run seed -- --destroy # Clear all data
```
