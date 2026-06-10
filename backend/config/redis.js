const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
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
