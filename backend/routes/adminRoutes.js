const express = require('express');
const router = express.Router();
const { createTrip, updateTrip, getAdminTrips, deleteTrip } = require('../controllers/adminController');

const { protect } = require('../middlewares/authMiddleware');

// POST /api/admin/trips
router.post('/trips', protect, createTrip);

// GET /api/admin/trips
router.get('/trips', protect, getAdminTrips);

// PUT /api/admin/trips/:id
router.put('/trips/:id', protect, updateTrip);

// DELETE /api/admin/trips/:id
router.delete('/trips/:id', protect, deleteTrip);

module.exports = router;
