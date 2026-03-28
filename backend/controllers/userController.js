const User = require('../models/User');
const Review = require('../models/Review');
const Ticket = require('../models/Ticket');
const Trip = require('../models/Trip');
const Reservation = require('../models/Reservation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT için kullanılacak gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-trip2go-key-2026';

// @desc    Kullanıcı kendi profil bilgilerini çeker
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Kullanıcıya ait tüm biletleri Sefer detaylarıyla birlikte çek
      const tickets = await Ticket.find({ user: user._id })
         .populate('trip')
         .sort({ createdAt: -1 });

      res.json({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt,
        tickets: tickets
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
  } catch (error) {
    console.error('getUserProfile Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Kullanıcı kendi profil bilgilerini günceller
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

      // Eğer şifre de güncellenmek isteniyorsa
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      // Front-end'deki LocalStorage'ı senkronize etmek için yeni bir Token döndürmekte fayda var
      const updatedToken = jwt.sign(
        { id: updatedUser._id, email: updatedUser.email, role: updatedUser.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        message: 'Profil bilgileriniz başarıyla güncellendi.',
        token: updatedToken,
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
  } catch (error) {
    console.error('updateUserProfile Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Kullanıcı kendi hesabını (ve ilişkili verilerini) tamamen siler
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // CASCADE DELETE: Kullanıcının yaptığı tüm yorumları sistemden uçuruyoruz
    const userIdString = user._id.toString();
    await Review.deleteMany({ userId: userIdString });

    // AKTİF BİLETLERİ İPTAL ET VE KOLTUKLARI BOŞALT
    const activeTickets = await Ticket.find({ user: user._id, status: 'active' });
    
    for (const ticket of activeTickets) {
       const trip = await Trip.findById(ticket.trip);
       if (trip) {
          const seatIndex = trip.seats.findIndex(s => s.seatNumber === ticket.seatNumber);
          if (seatIndex !== -1) {
             trip.seats[seatIndex].status = 'available';
             // Kritik Nokta: Cinsiyeti ve Yolcu kimliğini sıfırlamalıyız ki UI mavi/pembe takılı kalmasın
             trip.seats[seatIndex].gender = null;
             trip.seats[seatIndex].passengerId = null; 
             await trip.save();
          }
       }
    }

    // 2. ADIM: Satın alınmamış ama sepette kilitli duran geçici rezervasyonları temizle ve koltukları aç
    const activeReservations = await Reservation.find({ user: user._id });
    for (const resItem of activeReservations) {
       const trip = await Trip.findById(resItem.trip);
       if (trip) {
          for (const rs of resItem.seats) {
             const sIndex = trip.seats.findIndex(ts => ts.seatNumber === rs.seatNumber);
             if (sIndex !== -1 && trip.seats[sIndex].status === 'reserved') {
                trip.seats[sIndex].status = 'available';
                trip.seats[sIndex].gender = null;
             }
          }
          await trip.save();
       }
    }
    await Reservation.deleteMany({ user: user._id });
    
    // Tüm biletleri kalıcı silmeden, iptal edildi yapıyoruz ki muhasebede kalsın (Para iadesi yok mantığı)
    await Ticket.updateMany({ user: user._id }, { status: 'cancelled' });

    // Kullanıcının sistemdeki asıl varlığını siliyoruz
    await user.deleteOne();

    console.log(`Kullanıcı ve ilişkili tüm verileri kalıcı olarak silindi: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Hesabınız silindi. Aktif biletleriniz iptal edildi ve ücret iadesi yapılmayacaktır.'
    });

  } catch (error) {
    console.error('deleteUserProfile Hatası:', error);
    res.status(500).json({ message: 'Güvenlik nedenleriyle hesap silinemedi veya Sunucu hatası oluştu.' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
};
