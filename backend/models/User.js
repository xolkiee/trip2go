const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'user' }, // 'user' veya 'admin'
  companyName: { type: String, default: '' }, // Sadece adminler için firma adı
  companyType: { type: String, enum: ['bus', 'flight', ''], default: '' }, // Adminler için taşıt türü
  resetToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
