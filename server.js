const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./CONFIG/database');
const { errorHandler, apiLimiter } = require('./MIDDLEWARE/authMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'PUBLIC')));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Digital Banking System API is running',
    timestamp: new Date().toISOString(),
  });
});

const bankingRoutes = require('./ROUTES/bankingRoutes');
const authRoutes = require('./ROUTES/AuthRoutes');
const identityRoutes = require('./ROUTES/identityRoutes');
const webhookRoutes = require('./ROUTES/webhookRoutes');
const databaseRoutes = require('./ROUTES/databaseRoutes');

app.use('/api/banking', bankingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', identityRoutes);
app.use('/api/database', databaseRoutes);
app.use('/webhook', webhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`🚀 Digital Banking System Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Fintech Login Page: http://localhost:${PORT}/fintech-login`);
});