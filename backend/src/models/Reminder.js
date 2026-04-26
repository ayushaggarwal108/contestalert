const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  googleCalendarEventId: {
    type: String
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'synced', 'failed', 'cancelled'],
    default: 'pending'
  },
  errorMessage: {
    type: String // Optional, to store failure reason if status is 'failed'
  }
}, { timestamps: true });

// Ensure a user doesn't create multiple reminders for the same contest
reminderSchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
