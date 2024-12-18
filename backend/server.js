const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./Routes/authRoute');
const projectRoutes = require('./Routes/proRoute');
const helmet = require('helmet');
const projectProviderRoute=require('./Routes/projectProviderRoute')
const cors = require('cors');

const app = express();

// Enhanced security and configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Credentials'
  ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/pro', projectRoutes);
app.use('/api',projectProviderRoute)

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;