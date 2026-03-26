const Review = require('../models/Review');

// @desc    Yeni bir değerlendirme (review) ekler
// @route   POST /api/reviews
// @access  Public
const addReview = async (req, res) => {
  try {
    const { tripId, userId, rating, comment } = req.body;

    if (!tripId || !userId || !rating || !comment) {
      return res.status(400).json({ message: 'Lütfen tüm alanları (tripId, userId, rating, comment) doldurun.' });
    }

    const newReview = await Review.create({ tripId, userId, rating, comment });

    res.status(201).json({
      success: true,
      message: 'Değerlendirme başarıyla eklendi.',
      data: {
        id: newReview._id,
        tripId: newReview.tripId,
        userId: newReview.userId,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.createdAt
      }
    });
  } catch (error) {
    console.error('Add Review Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Belirli bir seferin yorumlarını listeler
// @route   GET /api/reviews/trip/:id
// @access  Public
const getTripReviews = async (req, res) => {
  try {
    const tripId = req.params.id;
    const tripReviews = await Review.find({ tripId }).sort({ createdAt: -1 });

    const mapped = tripReviews.map(r => ({
      id: r._id,
      tripId: r.tripId,
      userId: r.userId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }));

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (error) {
    console.error('Get Trip Reviews Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Kullanıcının kendi yorumunu düzenlemesini sağlar
// @route   PUT /api/reviews/:id
// @access  Public
const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Yorum bulunamadı.' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Yorum güncellendi.',
      data: {
        id: review._id,
        tripId: review.tripId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Update Review Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Kullanıcının kendi yorumunu silmesini sağlar
// @route   DELETE /api/reviews/:id
// @access  Public
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Silinecek yorum bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      message: 'Yorum başarıyla silindi.'
    });
  } catch (error) {
    console.error('Delete Review Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  addReview,
  getTripReviews,
  updateReview,
  deleteReview
};
