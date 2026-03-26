// In-memory reviews list
let reviews = [
  { id: 'r1', tripId: 't1', userId: 'user1', rating: 5, comment: 'Süper bir yolculuktu!', createdAt: new Date().toISOString() },
  { id: 'r2', tripId: 't1', userId: 'user2', rating: 4, comment: 'Otobüs rahattı, ikramlar taze.', createdAt: new Date().toISOString() },
  { id: 'r3', tripId: 't4', userId: 'user3', rating: 5, comment: 'Uçak zamanında kalktı, harika!', createdAt: new Date().toISOString() }
];

// @desc    Yeni bir değerlendirme (review) ekler
// @route   POST /api/reviews
// @access  Public
const addReview = async (req, res) => {
  try {
    const { tripId, userId, rating, comment } = req.body;

    if (!tripId || !userId || !rating || !comment) {
      return res.status(400).json({ message: 'Lütfen tüm alanları (tripId, userId, rating, comment) doldurun.' });
    }

    const newReview = {
      id: Date.now().toString(),
      tripId,
      userId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);

    res.status(201).json({
      success: true,
      message: 'Değerlendirme başarıyla eklendi.',
      data: newReview
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
    const tripReviews = reviews.filter(r => r.tripId === tripId);

    res.status(200).json({
      success: true,
      count: tripReviews.length,
      data: tripReviews
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

    const reviewIndex = reviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Yorum bulunamadı.' });
    }

    if (rating) reviews[reviewIndex].rating = rating;
    if (comment) reviews[reviewIndex].comment = comment;

    res.status(200).json({
      success: true,
      message: 'Yorum güncellendi.',
      data: reviews[reviewIndex]
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

    const reviewIndex = reviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Silinecek yorum bulunamadı.' });
    }

    reviews.splice(reviewIndex, 1);

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
