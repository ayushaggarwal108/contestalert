const { google } = require('googleapis');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const Contest = require('../models/Contest');

const createReminder = async (user, contestId) => {
  try {
    if (!user.refreshToken) {
      throw new Error('No refresh token found. User must connect Google Calendar.');
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      throw new Error('Contest not found.');
    }

    // Set up OAuth2 client with user's refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      '/auth/google/calendar/callback'
    );

    oauth2Client.setCredentials({
      refresh_token: user.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Ensure we don't duplicate reminders
    const existingReminder = await Reminder.findOne({ userId: user._id, contestId: contest._id });
    if (existingReminder && existingReminder.status === 'synced') {
       return { success: true, message: 'Reminder already exists on your calendar!' };
    }

    // Create the event
    const event = {
      summary: `🏆 Contest: ${contest.name}`,
      location: contest.url,
      description: `Contest Alert for ${contest.name} on ${contest.platform}.\n\nLink: ${contest.url}`,
      start: {
        dateTime: contest.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: contest.endTime.toISOString(),
        timeZone: 'UTC',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 },      // 30 minutes before
        ],
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    // Save reminder in database
    await Reminder.findOneAndUpdate(
      { userId: user._id, contestId: contest._id },
      {
        $set: {
          googleCalendarEventId: res.data.id,
          scheduledTime: contest.startTime,
          status: 'synced'
        }
      },
      { upsert: true }
    );

    return { success: true, message: 'Successfully scheduled on Google Calendar!' };
  } catch (error) {
    console.error('Calendar Service Error:', error);
    
    // Mark as failed in DB
    await Reminder.findOneAndUpdate(
      { userId: user._id, contestId: contestId },
      { $set: { status: 'failed', errorMessage: error.message } },
      { upsert: true }
    );
    
    throw error;
  }
};

module.exports = {
  createReminder
};
