const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB veritabanına başarıyla bağlanıldı.'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));


app.get('/', (req, res) => {
  res.send('Trip2Go API Başarıyla Çalışıyor!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışmaya başladı.`);
});