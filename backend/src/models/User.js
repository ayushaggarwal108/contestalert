const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String
  },
  refreshToken: {
    type: String
  },
  hasCalendarAccess: {
    type: Boolean,
    default: false
  },
  preferredPlatforms: {
    type: [String],
    default: ['Codeforces', 'LeetCode']
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
