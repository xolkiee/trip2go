const express = require('express');
const router = express.Router();
const { addReview, getTripReviews, updateReview, deleteReview } = require('../controllers/reviewController');

// POST /api/reviews
router.post('/', addReview);

// GET /api/reviews/trip/:id
router.get('/trip/:id', getTripReviews);

// PUT /api/reviews/:id
router.put('/:id', updateReview);

// DELETE /api/reviews/:id
router.delete('/:id', deleteReview);

module.exports = router;
