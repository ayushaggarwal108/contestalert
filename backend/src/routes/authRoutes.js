const express = require('express');
const passport = require('passport');
const router = express.Router();

// ---------------------------------------------------------
// Phase 1: Basic Login (Profile & Email)
// ---------------------------------------------------------

router.get('/google', passport.authenticate('google-login', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google-login', { failureRedirect: '/login-failed' }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

// ---------------------------------------------------------
// Phase 2: Calendar Scope Upgrade
// ---------------------------------------------------------

router.get('/google/calendar', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to connect your calendar' });
  }
  // Request calendar scope along with profile/email so passport can fetch the user profile successfully
  passport.authenticate('google-calendar', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
    accessType: 'offline',
    prompt: 'consent' 
  })(req, res, next);
});

router.get('/google/calendar/callback', 
  passport.authenticate('google-calendar', { failureRedirect: '/calendar-connect-failed' }),
  (req, res) => {
    // Successful calendar connection, redirect back to frontend
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    res.redirect(`${frontendUrl}/dashboard?calendar_connected=true`);
  }
);

// ---------------------------------------------------------
// Common Auth Routes
// ---------------------------------------------------------

router.get('/logout', (req, res) => {
  req.logout(() => {
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
    res.redirect(frontendUrl);
  });
});

router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        hasCalendarAccess: req.user.hasCalendarAccess,
        preferredPlatforms: req.user.preferredPlatforms
      }
    });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

module.exports = router;
