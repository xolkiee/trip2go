const express = require('express');
const router = express.Router();
const { createReservation, cancelReservation, getReservation, getActiveReservationForTrip } = require('../controllers/reservationController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createReservation);
router.get('/user/active/:tripId', protect, getActiveReservationForTrip);
router.delete('/:id', protect, cancelReservation);
router.get('/:id', protect, getReservation);

module.exports = router;
