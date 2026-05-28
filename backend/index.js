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
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'trip2godb' // Vercel'in eksik URL sebebiyle "test" veritabanına bağlanmasını kesin olarak engeller
    };

    cached.promise = mongoose.connect(DB_URI || '', opts).then((mongoose) => {
      console.log('MongoDB veritabanına başarıyla bağlanıldı (Serverless).');
      return mongoose;
    }).catch(err => {
      console.error('MongoDB BAĞLANTI HATASI:', err.message);
      throw err;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

// Gelen her istek öncesinde (middleware) veritabanı bağlantısının hazır olduğundan emin ol
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Veritabanı bağlantı hatası', error: error.message });
  }
});

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