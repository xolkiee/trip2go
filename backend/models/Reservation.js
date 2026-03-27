const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  seats: [{ 
    seatNumber: { type: Number, required: true },
    gender: { type: String, enum: ['erkek', 'kadin'], required: true }
  }],
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'completed'], default: 'active' }
}, { timestamps: true });

// Geçerlilik süresi dolan kilitlerin (Örn. 10 dk ödeme yapmayanların) MongoDB tarafından otomatik silinmesini sağlayan index.
// Bilet alınırsa kod tarafından (Controller) zaten manuel olarak bu belge silinecektir.
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reservation', reservationSchema);
