const { connectRabbitMQ, getChannel } = require('./services/rabbitmq');

const startWorker = async () => {
  // RabbitMQ servisine bağlanması için 2 saniye bekle
  setTimeout(async () => {
    const channel = getChannel();
    if (!channel) {
      console.log('Worker başlatılamadı, RabbitMQ kanalı yok.');
      return;
    }

    console.log('Worker: RabbitMQ kuyrukları dinleniyor...');

    // 1. Bilet Bildirim Kuyruğu (Satın Alım)
    channel.consume('ticket_notifications', (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log(`\n[WORKER] Yeni Bilet Satın Alındı!`);
        console.log(`[WORKER] Görev: ${data.userEmail} adresine E-Bilet PDF'i gönderiliyor...`);
        console.log(`[WORKER] Bilet ID: ${data.ticketId}, Tutar: ${data.price} ₺`);
        
        // Simülasyon: E-posta gönderimi 2 saniye sürüyor
        setTimeout(() => {
          console.log(`[WORKER] ✅ Bilet e-postası başarıyla gönderildi: ${data.userEmail}\n`);
          channel.ack(msg); // Mesajın işlendiğini RabbitMQ'ya bildir (Kuyruktan sil)
        }, 2000);
      }
    });

    // 2. Bilet İade Kuyruğu (İptal)
    channel.consume('ticket_refunds', (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log(`\n[WORKER] Bilet İptal Edildi!`);
        console.log(`[WORKER] Görev: Banka API'sine ${data.price} ₺ iade talebi iletiliyor...`);
        console.log(`[WORKER] İptal Edilen Bilet ID: ${data.ticketId}`);
        
        // Simülasyon: Banka iade süreci 3 saniye sürüyor
        setTimeout(() => {
          console.log(`[WORKER] ✅ Banka iadesi başarıyla tamamlandı. Paranız 3 iş günü içinde yatacak.\n`);
          channel.ack(msg);
        }, 3000);
      }
    });

  }, 2000);
};

module.exports = startWorker;
