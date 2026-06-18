const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://kaunsahostel.com', 'https://www.kaunsahostel.com'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_enquiry')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hostel-manager/auth', require('./routes/hostelManager'));
app.use('/api/hostel-manager', require('./routes/hostelManagerDashboard'));
app.use('/api/admin', require('./routes/adminHostelManager'));
app.use('/api/hostels', require('./routes/hostels'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/nearbyplaces', require('./routes/nearbyplaces'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/page-content', require('./routes/pageContent'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/visit-bookings', require('./routes/visitBookings'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/manual-payments', require('./routes/manualPayments'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/hostel-manager/payments', require('./routes/hostelManagerPayments'));

// Blog System Routes
app.use('/api/blog', require('./routes/blog.routes'));
const { categoryRouter, tagRouter, authorRouter, commentRouter, mediaRouter, analyticsRouter } = require('./routes/blog-supporting.routes');
app.use('/api/blog/categories', categoryRouter);
app.use('/api/blog/tags', tagRouter);
app.use('/api/blog/authors', authorRouter);
app.use('/api/blog/comments', commentRouter);
app.use('/api/blog/media', mediaRouter);
app.use('/api/blog/analytics', analyticsRouter);

// SEO Routes
app.use('/api', require('./routes/seo.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Emergency: Clear all auth cookies (for debugging)
app.get('/api/clear-cookies', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('manager_token');
  res.clearCookie('admin_token');
  res.json({ 
    message: 'All auth cookies cleared. Please login again.', 
    success: true 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});