const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./Routes/authRoute');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

app.use(helmet()); 
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
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

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



module.exports = app;