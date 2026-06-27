const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // FIXED: Added missing import

// Import Modular Routers
const adminRouter = require('./routes/adminRouter');
const studentRouter = require('./routes/studentRouter');
const staffRouter = require('./routes/staffRouter'); 
const authRouter = require('./routes/authRouter');

const app = express();

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // CRITICAL: Extracts JWT token from incoming cookies

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Assets Hosting
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'Assets')));

// Mount Root Authentication Pipelines (Login / Logout handlers)
app.use('/', authRouter);

// Mount Secure Section Routers (Protected behind authMiddleware gates)
app.use('/admin', adminRouter);
app.use('/student', studentRouter);
app.use('/staff', staffRouter);

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/your_database_name')
  .then(() => console.log("Database online & listening for connections"))
  .catch(err => console.error("Database connection failed:", err));

module.exports = app;
  
  
  








  
  












