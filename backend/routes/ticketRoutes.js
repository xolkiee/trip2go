const express = require('express');
const router = express.Router();
const { createTicket, cancelTicket, updatePassenger } = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createTicket);
router.delete('/:id', protect, cancelTicket);
router.put('/:id/passenger', protect, updatePassenger);

module.exports = router;
