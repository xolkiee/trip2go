const Trip = require('../models/Trip');
const Reservation = require('../models/Reservation');

function generateSeats(total, occupiedNumbers) {
  let seatArray = [];
  for (let i = 1; i <= total; i++) {
    seatArray.push({
      seatNumber: i,
      status: occupiedNumbers.includes(i) ? 'occupied' : 'available'
    });
  }
  return seatArray;
}

const dummyTrips = [
  {
    company: 'Kamil Koç', type: 'bus', seatLayout: '2+1', origin: 'İstanbul', destination: 'Ankara',
    departureTime: new Date('2026-04-10T10:00:00Z'), arrivalTime: new Date('2026-04-10T15:30:00Z'),
    price: 450, features: ['WiFi', 'TV', 'İkram'], seats: generateSeats(40, [3, 7, 12, 18, 25])
  },
  {
    company: 'Metro Turizm', type: 'bus', seatLayout: '2+2', origin: 'İstanbul', destination: 'Ankara',
    departureTime: new Date('2026-04-10T12:00:00Z'), arrivalTime: new Date('2026-04-10T18:00:00Z'),
    price: 400, features: ['İkram'], seats: generateSeats(44, [1, 2, 5, 8])
  },
  {
    company: 'Pamukkale', type: 'bus', seatLayout: '2+1', origin: 'İzmir', destination: 'Antalya',
    departureTime: new Date('2026-04-11T09:00:00Z'), arrivalTime: new Date('2026-04-11T16:00:00Z'),
    price: 550, features: ['WiFi', 'Geniş Koltuk', 'İkram'], seats: generateSeats(40, [10, 11, 20])
  },
  {
    company: 'THY', type: 'flight', seatLayout: 'flight', origin: 'İstanbul', destination: 'İzmir',
    departureTime: new Date('2026-04-12T08:00:00Z'), arrivalTime: new Date('2026-04-12T09:15:00Z'),
    price: 1800, features: ['Bagaj 15kg', 'İkram'], seats: generateSeats(120, [10,20,30,40,50,60,70])
  },
  {
    company: 'Pegasus', type: 'flight', seatLayout: 'flight', origin: 'Ankara', destination: 'Antalya',
    departureTime: new Date('2026-04-12T14:30:00Z'), arrivalTime: new Date('2026-04-12T15:40:00Z'),
    price: 1200, features: ['Bagaj 15kg'], seats: generateSeats(120, [5, 15, 25, 35, 45, 55])
  }
];

const seedTripsIfEmpty = async () => {
  try {
    const count = await Trip.countDocuments();
    if (count === 0) {
      console.log('Trip koleksiyonu boş, dummy veriler Mongoose ile ekleniyor...');
      await Trip.insertMany(dummyTrips);
    }
  } catch(err) {
    console.log("Seed hatası:", err);
  }
};

// @desc    Seferleri arar ve filtreler
// @route   GET /api/trips/search
// @access  Public
const searchTrips = async (req, res) => {
  try {

    const { origin, destination, tripDate, type } = req.query;
    let query = {};

    const escapeRegex = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    if (origin) query.origin = { $regex: escapeRegex(origin), $options: 'i' };
    if (destination) query.destination = { $regex: escapeRegex(destination), $options: 'i' };
    if (type) query.type = type.toLowerCase();

    const now = new Date();
    if (tripDate) {
      // Yerel saatte gece yarısı ve sonu
      let startOfDay = new Date(`${tripDate}T00:00:00`);
      const endOfDay = new Date(`${tripDate}T23:59:59`);
      
      // Eğer aranan tarih bugünse ve geçmiş bir saatse startOfDay'i şu ana al
      if (startOfDay < now) {
          startOfDay = now;
      }
      
      query.departureTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Tarih seçilmemişse bile genel olarak geçmiş saat ve günleri temizle
      query.departureTime = { $gte: now };
    }
    
    console.log("SEARCH QUERY:", JSON.stringify(query));

    const results = await Trip.find(query).sort({ departureTime: 1 });
    console.log("FOUND RESULTS COUNT:", results.length);

    // Aktif Rezervasyonları Bul (Sadece süresi geçmemiş olanlar)
    const activeReservations = await Reservation.find({
        trip: { $in: results.map(r => r._id) },
        expiresAt: { $gt: Date.now() }
    });

    const Review = require('../models/Review');
    const uniqueAdmins = [...new Set(results.map(t => t.createdBy?.toString()).filter(Boolean))];
    const adminRatings = {};
    if (uniqueAdmins.length > 0) {
        // Şirket puanlarını toplu olarak çekiyoruz (N+1 Query problemini çözerek 10s timeout riskini azaltıyoruz)
        const allAdminTrips = await Trip.find({ createdBy: { $in: uniqueAdmins } }).select('_id createdBy');
        const adminTripIdsMap = {};
        allAdminTrips.forEach(at => {
            const cid = at.createdBy.toString();
            if (!adminTripIdsMap[cid]) adminTripIdsMap[cid] = [];
            adminTripIdsMap[cid].push(at._id.toString());
        });
        
        const allRelevantTripIds = allAdminTrips.map(t => t._id);
        const allReviews = await Review.find({ tripId: { $in: allRelevantTripIds } });
        
        uniqueAdmins.forEach(adminId => {
            const adminTripIds = adminTripIdsMap[adminId] || [];
            const reviews = allReviews.filter(r => adminTripIds.includes(r.tripId.toString()));
            if (reviews.length > 0) {
                const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                adminRatings[adminId] = { avg: avg.toFixed(1), count: reviews.length };
            }
        });
    }

    const mappedResults = results.map(t => {
      const tripObj = t.toObject();
      const tripReservationsLength = activeReservations.filter(r => r.trip.toString() === tripObj._id.toString()).length;
      
      // Boş Koltuk Sayısını (Dolu ve Rezerve olanları çıkararak) bul
      let availableSeats = tripObj.seats.filter(s => s.status === 'available').length;
      availableSeats = availableSeats - tripReservationsLength;
      if (availableSeats < 0) availableSeats = 0;
      
      // Prepare features including seatLayout if it exists
      let features = [...(tripObj.features || [])];
      if (tripObj.seatLayout) {
        features.unshift(tripObj.seatLayout); // Add seatLayout to the beginning of features
      }

      let ratingInfo = null;
      if (tripObj.createdBy && adminRatings[tripObj.createdBy.toString()]) {
         ratingInfo = adminRatings[tripObj.createdBy.toString()];
      }

      return {
        id: tripObj._id,
        ...tripObj,
        seats: undefined, // Koltuk listesini arama sonucunda gönderme
        availableSeats,
        totalSeats: tripObj.seats.length,
        features: features, 
        seatLayout: tripObj.seatLayout,
        ratingInfo
      };
    });

    res.status(200).json({
      success: true,
      count: mappedResults.length,
      data: mappedResults
    });

  } catch (error) {
    console.error('Search Trips Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Seçili seferin detaylarını ve koltuk dizilimini (seat map) getirir
// @route   GET /api/trips/:id/details
// @access  Public
const getTripDetails = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Sefer bulunamadı.' });
    }

    const tripObj = trip.toObject();
    tripObj.id = tripObj._id;

    // Aktif (süresi dolmamış) rezervasyonları Trip'in içine entegre et
    const activeReservations = await Reservation.find({ 
        trip: trip._id, 
        expiresAt: { $gt: Date.now() } 
    });
    const reservedSeatNumbers = [];
    activeReservations.forEach(r => {
       if (r.seats && Array.isArray(r.seats)) {
           reservedSeatNumbers.push(...r.seats);
       }
    });

    tripObj.seats.forEach(seat => {
        if (seat.status === 'available') {
             const reservedRule = activeReservations.find(r => r.seats.some(s => s.seatNumber === seat.seatNumber));
             if (reservedRule) {
                 seat.status = 'reserved';
                 const sInfo = reservedRule.seats.find(s => s.seatNumber === seat.seatNumber);
                 seat.gender = sInfo.gender;
             }
        }
    });

    res.status(200).json({
      success: true,
      data: tripObj
    });

  } catch (error) {
    console.error('Get Trip Details Hatası:', error);
    if(error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Sefer bulunamadı. Geçersiz ID.' });
    }
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  searchTrips,
  getTripDetails
};
