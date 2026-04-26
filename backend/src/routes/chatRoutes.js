const express = require('express');
const router = express.Router();
const { processChat } = require('../services/geminiService');
const { createReminder } = require('../services/calendarService');

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Pass history to processChat
    const userId = req.user ? req.user._id : 'anonymous';
    const response = await processChat(userId, message, history || []);

    // Check if the intent is to schedule a reminder
    if (response.intent === 'schedule' && response.scheduleParams?.contestId) {
      if (!req.isAuthenticated()) {
        response.responseMessage = 'I would love to set a reminder for you, but you need to log in first!';
      } else if (!req.user.hasCalendarAccess) {
        response.responseMessage = 'I can schedule that, but you need to connect your Google Calendar first using the button on your dashboard.';
      } else {
        // Attempt to create the Google Calendar event
        try {
          await createReminder(req.user, response.scheduleParams.contestId);
          // Overwrite the system's response with a solid confirmation
          response.responseMessage = `✅ Awesome! I've successfully scheduled a Google Calendar reminder for ${response.scheduleParams.contestName}.`;
        } catch (calError) {
          console.error("Calendar scheduling failed:", calError);
          response.responseMessage = "I tried to schedule the reminder, but something went wrong with Google Calendar. Please make sure your permissions are correct and try again.";
        }
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Chat Route Error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

module.exports = router;
