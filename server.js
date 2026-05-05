const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./CONFIG/database');
const { errorHandler } = require('./MIDDLEWARE/authMiddleware');

// Routes
const bankingRoutes = require('./ROUTES/bankingRoutes');
const authRoutes = require('./ROUTES/AuthRoutes');
const identityRoutes = require('./ROUTES/identityRoutes');
const databaseRoutes = require('./ROUTES/databaseRoutes');
const webhookRoutes = require('./ROUTES/webhookRoutes');

const app = express();

app.use((req, res, next) => {
  console.log("➡️ REQUEST:", req.method, req.originalUrl);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/banking', bankingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/database', databaseRoutes);
app.use('/webhook', webhookRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Digital Banking System API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// START SERVER ONLY AFTER DB CONNECTS
async function startServer() {
  try {
    await connectDB();
    console.log('🟢 MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Digital Banking System Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📱 Fintech Login Page: http://localhost:${PORT}/fintech-login`);
  
    });

  } catch (err) {
    console.error('❌ DB failed:', err);
    process.exit(1);
  }
}

startServer();