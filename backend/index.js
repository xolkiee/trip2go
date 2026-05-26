const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error("KRİTİK HATA: MONGO_URI çevresel değişkeni (Environment Variable) bulunamadı! Lütfen Vercel panelinden veya .env dosyasından tanımlayın.");
}

// Vercel Serverless Function için bağlantı önbellekleme (Performans artışı için)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = mongoose.connect(DB_URI || '', {
    serverSelectionTimeoutMS: 5000, 
    // connectTimeoutMS silindi çünkü 10s timeout riskini artırıyor, varsayılan kalsın
    socketTimeoutMS: 45000
  })
  .then((m) => {
    console.log('MongoDB veritabanına başarıyla bağlanıldı.');
    return m;
  })
  .catch((err) => {
    console.error('MongoDB BAĞLANTI HATASI:', err.message);
    global.mongoose = null; // Bağlantı hatasında sıfırla ki tekrar denesin
  });
}

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const tripRoutes = require('./routes/tripRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (req, res) => {
  res.send('Trip2Go API Başarıyla Çalışıyor!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışmaya başladı.`);
});

module.exports = app;