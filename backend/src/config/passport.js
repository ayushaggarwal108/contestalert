const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Strategy 1: Basic Login (Profile + Email)
passport.use('google-login', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatarUrl: profile.photos[0].value
        });
      }
      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));

// Strategy 2: Calendar Scope Upgrade
// We need a separate strategy configuration to ask for additional scopes
// Note: It uses the same credentials but a different callback to handle the calendar token specifically.
passport.use('google-calendar', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/calendar/callback',
    proxy: true,
    passReqToCallback: true // We need the request object to know which user is logged in
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      if (!req.user) {
        return done(new Error('User must be logged in to connect Calendar'), null);
      }
      
      // Update the existing user with the refresh token and set access to true
      const user = await User.findById(req.user.id);
      if (refreshToken) {
        user.refreshToken = refreshToken;
      }
      user.hasCalendarAccess = true;
      await user.save();
      
      return done(null, user);
    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));
