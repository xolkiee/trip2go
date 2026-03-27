const Trip = require('../models/Trip');
const Reservation = require('../models/Reservation');
const Ticket = require('../models/Ticket');

// @desc    Geçici Koltuk Kilitleme (10 Dk)
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Yönetici hesapları bilet satın alamaz.' });
    }

    const { tripId, seats } = req.body;

    if (!tripId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Sefer ID ve en az bir Koltuk Numarası gereklidir.' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Sefer bulunamadı.' });
    }

    // Seçilen koltukların satılmış (occupied) olup olmadığını kontrol et
    for (const seatReq of seats) {
       const seatNum = Number(seatReq.seatNumber);
       const seat = trip.seats.find(s => s.seatNumber === seatNum);
       if (!seat) return res.status(404).json({ success: false, message: `${seatNum} numaralı koltuk bulunamadı.` });
       if (seat.status === 'occupied') {
          return res.status(400).json({ success: false, message: `${seatNum} numaralı koltuk zaten satılmış.` });
       }
    }

    // ** GENDER-LOCK ADJACENCY LOGIC **
    if (trip.type === 'bus') {
       const activeReservations = await Reservation.find({ trip: tripId, expiresAt: { $gt: Date.now() } });

       for (const seatReq of seats) {
          const seatNum = Number(seatReq.seatNumber);
          const myGender = seatReq.gender;

          let adjacentNum = null;
          if (trip.seatLayout === '2+1') {
             if (seatNum % 3 === 2) adjacentNum = seatNum + 1;
             else if (seatNum % 3 === 0) adjacentNum = seatNum - 1;
          } else if (trip.seatLayout === '2+2') {
             if (seatNum % 2 === 1) adjacentNum = seatNum + 1;
             else if (seatNum % 2 === 0) adjacentNum = seatNum - 1;
          }

          if (adjacentNum) {
             const inMyCart = seats.find(s => Number(s.seatNumber) === adjacentNum);
             if (inMyCart) continue; // Aynı sepette birlikte alıyorsa sorun yok

             const adjSeatInTrip = trip.seats.find(s => s.seatNumber === adjacentNum);
             let adjGender = null;

             if (adjSeatInTrip && adjSeatInTrip.status === 'occupied') {
                // Eğer bu koltuk şu an giriş yapan kullanıcıya aitse (daha önceden o almışsa), zıt cinsiyet almasına müsaade et!
                const myPastTicket = await Ticket.findOne({
                   trip: tripId,
                   seatNumber: adjacentNum,
                   user: req.user._id,
                   status: { $ne: 'cancelled' }
                });

                if (!myPastTicket) {
                   adjGender = adjSeatInTrip.gender; // Başkasına ait kalıcı cinsiyet
                }
             } else {
                const reservedDoc = activeReservations.find(r => r.seats.some(s => s.seatNumber === adjacentNum));
                if (reservedDoc) {
                   const sInfo = reservedDoc.seats.find(s => s.seatNumber === adjacentNum);
                   adjGender = sInfo.gender; // Geçici kilit konan cinsiyet
                }
             }

             if (adjGender && adjGender !== myGender) {
                return res.status(400).json({ success: false, message: `${seatNum} numaralı koltuk, yanındaki (${adjacentNum}) karşıt cinsiyet nedeniyle seçilemez.` });
             }
          }
       }
    }

    // Seçili koltuklara ait devam eden (10 dksı dolmamış) başka bir kullanıcının rezervasyonu var mı?
    const seatNumbersOnly = seats.map(s => Number(s.seatNumber));
    const existingReservations = await Reservation.find({ 
       trip: tripId, 
       'seats.seatNumber': { $in: seatNumbersOnly } 
    });
    
    for (const existingRes of existingReservations) {
      if (existingRes.expiresAt > Date.now()) {
         return res.status(400).json({ success: false, message: 'Koltuklardan bazıları başka bir yolcu tarafından ödeme adımında rezerve edilmiş durumda. Lütfen tekrar deneyiniz.' });
      } else {
         // Süresi geçmiş ama henüz silinmemiş
         await Reservation.findByIdAndDelete(existingRes._id);
      }
    }

    // O sefer için bu kullanıcının daha önceki açık sepetlerini dök (Sadece 1 sepet aktif olsun)
    await Reservation.deleteMany({ user: req.user._id, trip: tripId });

    // Koltukları o an giriş yapan adamın üstüne 10 dk kitle
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

    const newReservation = await Reservation.create({
      user: req.user._id,
      trip: tripId,
      seats,
      expiresAt,
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Koltuk 10 dakikalığına sizin adınıza başarıyla ayrıldı.',
      data: newReservation
    });

  } catch (error) {
    console.error("Create Reservation Hatası:", error);
    return res.status(500).json({ success: false, message: 'Koltuk rezerve edilemedi, sunucu arızası.' });
  }
};

// @desc    Rezervasyon İptali (Kullanıcı kendi vazgeçerse kilidi açar)
// @route   DELETE /api/reservations/:id
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
       return res.status(404).json({ success: false, message: 'Rezervasyon kaydı bulunamadı.' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
       return res.status(403).json({ success: false, message: 'Sadece kendi sepetinizi boşaltabilirsiniz.' });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Rezervasyon iptal edildi, koltuk diğer yolcular için serbest bırakıldı.'
    });

  } catch(err) {
    console.error("Cancel Reservation Hatası:", err);
    return res.status(500).json({ success: false, message: 'İptal edilirken sunucu hatası.' });
  }
}

// @desc    Geçici Rezervasyonu Getir (Ödeme Ekranı İçin)
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
       .populate('trip'); // Sefer verilerini de dahil et
       
    if (!reservation) {
       return res.status(404).json({ success: false, message: 'Rezervasyon bulunamadı veya süresi dolmuş.' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
       return res.status(403).json({ success: false, message: 'Erişim reddedildi.' });
    }

    return res.status(200).json({
      success: true,
      data: reservation
    });

  } catch(err) {
    console.error("Get Reservation Hatası:", err);
    return res.status(500).json({ success: false, message: 'Rezervasyon yüklenemedi.' });
  }
}

// @desc    Kullanıcının bu sefere ait aktif rezervasyonunu getir
// @route   GET /api/reservations/user/active/:tripId
// @access  Private
const getActiveReservationForTrip = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      user: req.user._id,
      trip: req.params.tripId,
      expiresAt: { $gt: Date.now() },
      status: 'active'
    });
    
    if (reservation) {
      return res.status(200).json({ success: true, data: reservation });
    } else {
      return res.status(404).json({ success: false, message: 'Aktif rezervasyon yok.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Hata.' });
  }
};

module.exports = {
  createReservation,
  cancelReservation,
  getReservation,
  getActiveReservationForTrip
};
