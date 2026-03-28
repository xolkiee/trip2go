const Trip = require('../models/Trip');

// Yardımcı Fonksiyon: Düzenin koltuk sayısına göre sayısal dizi oluşturur
function generateSeats(total) {
  let seatArray = [];
  for (let i = 1; i <= total; i++) {
    seatArray.push({
      seatNumber: i,
      status: 'available'
    });
  }
  return seatArray;
}

const createTrip = async (req, res) => {
  try {
    let { company, type, seatLayout, departure, destination, date, time, arrivalTime, price } = req.body;

    if (!company || !type || !departure || !destination || !date || !time || !arrivalTime || !price) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm zorunlu alanları (Firma, Tip, Kalkış, Varış, Tarihler vb.) doldurun.'
      });
    }

    // Otomatik Koltuk Hesaplaması (Furkan'ın Kuralı)
    let autoTotalSeats = 44; // Default 2+2 durumu
    if (type === 'bus') {
      if (seatLayout === '2+1') autoTotalSeats = 40;
      else if (seatLayout === '2+2') autoTotalSeats = 44;
      else seatLayout = '2+2'; // Fallback
    } else if (type === 'flight') {
      seatLayout = 'flight';
      autoTotalSeats = 120;
    }

    // Z kullanmadığımız için yerel saat dilimine göre algılar
    // Vercel serverless ortamı UTC çalıştığı için TR saati olduğunu +03:00 ile belirtiyoruz
    const departureDateStr = `${date}T${time}:00+03:00`;
    const departureDateObj = new Date(departureDateStr);

    let arrivalDateObj = new Date(`${date}T${arrivalTime}:00+03:00`);

    // Eğer varış saati, kalkış saatinden önceyse (gece yarısını geçmişse) ertesi gün kabul edelim
    if (arrivalDateObj < departureDateObj) {
      arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
    }

    // Koltuk şemasını oluştur
    const seats = generateSeats(autoTotalSeats);

    // MongoDB'ye kaydet
    const newTrip = await Trip.create({
      company,
      type,
      seatLayout,
      origin: departure,
      destination,
      departureTime: departureDateObj,
      arrivalTime: arrivalDateObj,
      price: Number(price),
      seats,
      features: ['Standart'], // Opsiyonel dummy özellik
      createdBy: req.user._id // Admin'in ID'sini kaydet
    });

    return res.status(201).json({
      success: true,
      message: 'Sefer başarıyla oluşturuldu ve veritabanına kaydedildi!',
      data: newTrip
    });

  } catch (error) {
    console.error("Admin Trip Create Hatası:", error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: Sefer oluşturulamadı.'
    });
  }
};

const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { departure, destination, date, time, price, arrivalTime } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID belirtilmedi.' });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Güncellenmek istenen sefer bulunamadı.' });
    }

    // Yetki kontrolü (Sadece oluşturan admin silebilir/düzenleyebilir)
    if (trip.createdBy && trip.createdBy.toString() !== req.user._id.toString()) {
       return res.status(403).json({ success: false, message: 'Bu seferi düzenlemeye yetkiniz yok.' });
    }

    // Gelen bilgilere göre update
    if (departure) trip.origin = departure;
    if (destination) trip.destination = destination;
    if (price) trip.price = Number(price);
    
    if (date && time && arrivalTime) {
      const departureDateStr = `${date}T${time}:00+03:00`;
      const departureDateObj = new Date(departureDateStr);
      let arrivalDateObj = new Date(`${date}T${arrivalTime}:00+03:00`);
      if (arrivalDateObj < departureDateObj) arrivalDateObj.setDate(arrivalDateObj.getDate() + 1);
      
      trip.departureTime = departureDateObj;
      trip.arrivalTime = arrivalDateObj;
    }
    
    await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Sefer başarıyla güncellendi.',
      data: trip
    });
  } catch (error) {
    console.error("Admin Trip Update Hatası:", error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: Sefer güncellenemedi.'
    });
  }
};

const getAdminTrips = async (req, res) => {
  try {
    // Adminin oluşturduğu veya createdBy girilmemiş seferleri bul
    // Eğer createdBy modelde yoksa güvenlik için sadece createdBy: req.user._id gösterilebilir
    const trips = await Trip.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error("Admin Fetch Trips Hatası:", error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: Seferler listelenemedi.',
      error: error.message
    });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Silinecek sefer bulunamadı.' });
    
    if (trip.createdBy && trip.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Sadece eklediğiniz seferleri silebilirsiniz.' });
    }
    
    // findByIdAndDelete instead of remove() to avoid mongoose 6+ issues.
    await Trip.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: 'Sefer başarıyla silindi ve yayından kaldırıldı.'
    });
  } catch(error) {
    console.error("Delete Trip Hatası:", error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: Sefer silinemedi.'
    });
  }
};

module.exports = {
  createTrip,
  updateTrip,
  getAdminTrips,
  deleteTrip
};
