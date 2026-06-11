const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  disableOfflineQueue: true, // Vercel'de socket koptuğunda sonsuz bekleme (hang) yapmasını önler
  pingInterval: 1000 * 60 * 4, // 4 dakikada bir ping atarak Upstash'in bağlantıyı koparmasını önler
  socket: {
    connectTimeout: 10000 // 10 saniye içinde bağlanamazsa hata fırlatır
  }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis sunucusuna başarıyla bağlanıldı.'));

(async () => {
  // Eğer Vercel ortamındaysak ve REDIS_URL yoksa bağlanmaya çalışma (Crash'i önler)
  if (process.env.VERCEL && !process.env.REDIS_URL) {
      console.log('Vercel ortamında Redis pas geçiliyor...');
      return;
  }
  
  try {
    await redisClient.connect();
  } catch (err) {
    console.log('Redis bağlantısı kurulamadı. Lokal test için Docker kullanımını unutmayın.');
  }
})();

module.exports = redisClient;
