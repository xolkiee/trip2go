const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis sunucusuna başarıyla bağlanıldı.'));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.log('Redis bağlantısı kurulamadı. (Eğer lokalde test ediyorsanız Docker üzerinden Redis sunucusunu ayağa kaldırdığınıza emin olun).');
  }
})();

module.exports = redisClient;
