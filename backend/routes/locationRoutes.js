const express = require('express');
const router = express.Router();
const { getLocations } = require('../controllers/locationController');

// GET /api/locations
router.get('/', getLocations);

module.exports = router;
