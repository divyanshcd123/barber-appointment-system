const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const barberRoutes = require('./routes/barberRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Native Helmet header protection middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self' https://checkout.razorpay.com; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; img-src 'self' data:; style-src 'self' 'unsafe-inline';");
  next();
});

// Native In-Memory Rate Limiting
const rateLimitStore = {};
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const limit = 300; // 300 requests per 15 min window
  const windowMs = 15 * 60 * 1000;

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, resetTime: now + windowMs };
  } else {
    const record = rateLimitStore[ip];
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    if (record.count > limit) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded. Please try again in 15 minutes.' });
    }
  }
  next();
});

// Native XSS sanitization
const xssClean = (data) => {
  if (typeof data === 'string') {
    return data.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(data)) {
    return data.map(xssClean);
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = xssClean(data[key]);
    }
    return sanitized;
  }
  return data;
};
app.use((req, res, next) => {
  if (req.body) req.body = xssClean(req.body);
  if (req.query) req.query = xssClean(req.query);
  if (req.params) req.params = xssClean(req.params);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
