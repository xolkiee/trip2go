const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['city', 'airport'], required: true },
  name: { type: String, required: true },
  code: { type: String, required: true }
});

module.exports = mongoose.model('Location', locationSchema);
