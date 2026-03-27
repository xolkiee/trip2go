const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  seatNumber: { type: Number, required: true },
  passenger: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    identityNumber: { type: String, required: true }, // TCKN veya Pasaport Numarası
    contactPhone: { type: String, required: true }
  },
  price: { type: Number, required: true }, // Biletin alındığı andaki fiyatı (İleride fiyat artsa bile biletteki fiyat değişmez)
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
