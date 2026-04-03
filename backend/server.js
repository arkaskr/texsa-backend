const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Must be called before anything else that relies on process.env
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const inventoryRequestRoutes = require('./routes/inventoryRequestRoutes');
const saleRoutes = require('./routes/saleRoutes');
const targetRoutes = require('./routes/targetRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');


connectDB();

const app = express();

const corsOptions = {
  origin: [
    'https://texsa-admin.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/inventory', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory-requests', inventoryRequestRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error Caught:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  let message = 'Unknown Server Error';
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === 'string') {
    message = err;
  } else if (err && err.message) {
    message = err.message;
  } else if (err && err.error && err.error.message) {
    message = err.error.message;
  } else {
    try {
      message = JSON.stringify(err);
    } catch (e) {
      message = 'Unstringifiable error object';
    }
  }

  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === 'production' ? null : (err.stack || null),
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(
    PORT,
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
}

module.exports = app;
