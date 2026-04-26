const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');

// GET /api/contests - Fetch upcoming contests with pagination
router.get('/contests', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    
    // Optional filters
    const platforms = req.query.platforms ? req.query.platforms.split(',') : null;
    
    // Build query
    const filter = { 
      status: { $in: ['upcoming', 'ongoing'] },
      endTime: { $gte: new Date() } // Ensure they are truly in the future/ongoing
    };
    
    if (platforms && platforms.length > 0) {
      filter.platform = { $in: platforms };
    }

    const total = await Contest.countDocuments(filter);
    
    const contests = await Contest.find(filter)
      .sort({ startTime: 1 })
      .skip(page * limit)
      .limit(limit);

    res.json({
      data: contests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contests API:', error);
    res.status(500).json({ error: 'Server error fetching contests' });
  }
});

module.exports = router;
