const express = require('express');
const router = express.Router();
const { searchTrips, getTripDetails } = require('../controllers/tripController');

// GET /api/trips/search
router.get('/search', searchTrips);

// GET /api/trips/:id/details
router.get('/:id/details', getTripDetails);

module.exports = router;
