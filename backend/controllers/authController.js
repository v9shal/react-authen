const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt')

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { 
        id: user._id, 
        username: user.username 
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;


    const user = await User.findOne({ 
      username: username.trim() 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: 'Incorrect password'
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', 
      maxAge: 3600000 
    });

    res.status(200).json({ 
      message: 'Login successful',
      user: { 
        id: user._id, 
        username: user.username 
      }
    });

  } catch (error) {
    console.error('Comprehensive Login Error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

exports.verify = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: "No token present to verify" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    res.status(200).json({
      message: "authorized",
      user: {
        id: decoded.id,
        username: decoded.username,
      }
    });
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(401).json({ 
      message: 'Invalid or expired token' 
    });
  }
};