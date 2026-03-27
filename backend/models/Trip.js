const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  status: { type: String, enum: ['available', 'reserved', 'occupied'], default: 'available' }
});

const tripSchema = new mongoose.Schema({
  company: { type: String, required: true },
  type: { type: String, enum: ['bus', 'flight'], required: true },
  seatLayout: { type: String, enum: ['2+1', '2+2', 'flight'], default: '2+2' },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
  seats: [seatSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
