const Trip = require('../models/Trip');
const Ticket = require('../models/Ticket');
const Reservation = require('../models/Reservation');

// @desc    Yeni bilet satın al ve koltuğun statüsünü occupied yap
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    const { tripId, passengers, price } = req.body;

    // Seferi Bul
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Sefer bulunamadı.' });

    // Koltukların doğruluğunu topluca test et
    for (const p of passengers) {
        const seatIndex = trip.seats.findIndex(s => s.seatNumber === Number(p.seatNumber));
        if (seatIndex === -1) return res.status(404).json({ success: false, message: `${p.seatNumber} koltuk numarası geçersiz.` });
        
        if (trip.seats[seatIndex].status === 'occupied') {
            return res.status(400).json({ success: false, message: `${p.seatNumber} numaralı koltuk maalesef satılmış. Lütfen sepetinizi güncelleyin.` });
        }
    }

    const createdTickets = [];

    // Her şey yolundaysa, biletleri oluştur ve seferdeki koltukları kapat
    for (const p of passengers) {
        const newTicket = await Ticket.create({
          user: req.user._id,
          trip: tripId,
          seatNumber: p.seatNumber,
          passenger: p.passengerInfo,
          price
        });
        createdTickets.push(newTicket);

        const seatIndex = trip.seats.findIndex(s => s.seatNumber === Number(p.seatNumber));
        trip.seats[seatIndex].status = 'occupied';
    }

    await trip.save();

    // Kullanıcının bu sefere ait arkada kalan açık tüm rezervasyonlarını temizle (Sepeti tamamen boşalt)
    await Reservation.deleteMany({ trip: tripId, user: req.user._id });

    return res.status(201).json({
      success: true,
      message: 'Ödeme başarılı, biletler oluşturuldu!',
      data: createdTickets
    });

  } catch (error) {
    console.error("Create Ticket Hatası:", error);
    return res.status(500).json({ success: false, message: 'Bilet işlemleri sırasında sunucu hatası oluştu.' });
  }
};

// @desc    Satın Alınan Bileti İptal Et
// @route   DELETE /api/tickets/:id
// @access  Private
const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('trip');
    
    if (!ticket) return res.status(404).json({ success: false, message: 'Bilet bulunamadı.' });

    if (ticket.trip && new Date(ticket.trip.departureTime) <= new Date()) {
        return res.status(400).json({ success: false, message: 'Sefer saati geldiği veya geçtiği için bilet iptal edilemez.' });
    }

    // Güvenlik
    if (ticket.user.toString() !== req.user._id.toString()) {
       return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
    }

    if (ticket.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Bu bilet zaten iptal edilmiş.' });
    }

    // Bileti iptal et
    ticket.status = 'cancelled';
    await ticket.save();

    // Aracın içindeki koltuğu diğer yolcular için boşa çıkar
    const trip = ticket.trip;
    if (trip) {
       const seatIndex = trip.seats.findIndex(s => s.seatNumber === ticket.seatNumber);
       if (seatIndex !== -1) {
          trip.seats[seatIndex].status = 'available';
          await trip.save();
       }
    }

    return res.status(200).json({
      success: true,
      message: 'Bilet iptal edildi ve iade süreci başlatıldı.'
    });

  } catch (error) {
    console.error("Cancel Ticket Hatası:", error);
    return res.status(500).json({ success: false, message: 'Bilet iptali sağlanamadı.' });
  }
};

// @desc    Yolcu Bilgilerini Güncelle (TC, İsim)
// @route   PUT /api/tickets/:id/passenger
// @access  Private
const updatePassenger = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('trip');
        
        if (!ticket) return res.status(404).json({ success: false, message: 'Bilet bulunamadı.' });

        if (ticket.trip && new Date(ticket.trip.departureTime) <= new Date()) {
            return res.status(400).json({ success: false, message: 'Seferin hareket saati geldiği/geçtiği için yolcu bilgileri artık güncellenemez.' });
        }
    
        if (ticket.user.toString() !== req.user._id.toString()) {
           return res.status(403).json({ success: false, message: 'Yetkisiz işlem.' });
        }
    
        if (ticket.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'İptal edilmiş biletlerde değişiklik yapılamaz.' });
        }
        
        // Gelen bilgileri birleştir
        ticket.passenger = { ...ticket.passenger, ...req.body.passenger };
        await ticket.save();
    
        return res.status(200).json({
          success: true,
          message: 'Yolcu bilgileri başarıyla güncellendi.',
          data: ticket
        });
    
      } catch (error) {
        console.error("Update Passenger Hatası:", error);
        return res.status(500).json({ success: false, message: 'Bilgiler güncellenemedi.' });
      }
};

module.exports = {
  createTicket,
  cancelTicket,
  updatePassenger
};
