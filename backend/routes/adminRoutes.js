const express = require('express');
const router = express.Router();
const { createTrip, updateTrip } = require('../controllers/adminController');

// POST /api/admin/trips
router.post('/trips', createTrip);

// PUT /api/admin/trips/:id
router.put('/trips/:id', updateTrip);

module.exports = router;
