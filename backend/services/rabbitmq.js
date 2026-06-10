const amqp = require('amqplib');
const dotenv = require('dotenv');

dotenv.config();

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();
    console.log('RabbitMQ sunucusuna başarıyla bağlanıldı.');

    // Kuyrukları önceden tanımla (Eğer yoksa oluşturur)
    await channel.assertQueue('ticket_notifications', { durable: true });
    await channel.assertQueue('ticket_refunds', { durable: true });

  } catch (error) {
    console.error('RabbitMQ Bağlantı Hatası:', error);
  }
};

const sendToQueue = (queueName, data) => {
  if (!channel) {
    console.error('RabbitMQ kanalı hazır değil. Mesaj gönderilemedi.');
    return;
  }
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), { persistent: true });
  console.log(`RabbitMQ: Mesaj [${queueName}] kuyruğuna eklendi.`);
};

const getChannel = () => channel;

module.exports = {
  connectRabbitMQ,
  sendToQueue,
  getChannel
};
