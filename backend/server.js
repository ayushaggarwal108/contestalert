require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

const connectDB = require('./src/config/db');
require('./src/config/passport'); // Initialize passport strategies

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const cron = require('node-cron');
const { fetchAndStoreContests } = require('./src/services/contestScraperService');

const app = express();

// Connect to Database
// Uncomment when you have a MONGO_URI in .env
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Default Vite port
  credentials: true
}));

// Trust proxy for secure cookies on Render/Heroku
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Fetch contests immediately on startup
  console.log('Running initial contest scraper...');
  fetchAndStoreContests();

  // Initialize Cron Job to fetch contests every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('Running scheduled contest scraper...');
    fetchAndStoreContests();
  });
});
