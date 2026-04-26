const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Codeforces', 'LeetCode', 'AtCoder', 'CodeChef', 'HackerRank', 'Other']
  },
  url: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, { timestamps: true });

// Compound index for reliable UPSERT deduplication
contestSchema.index({ platform: 1, url: 1 }, { unique: true });

module.exports = mongoose.model('Contest', contestSchema);
