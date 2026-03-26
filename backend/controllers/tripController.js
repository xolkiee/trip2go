const Trip = require('../models/Trip');

// Dummy Trips Data (Veritabanı boşsa eklenecek)
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
    company: 'Kamil Koç', type: 'bus', origin: 'İstanbul', destination: 'Ankara',
    departureTime: new Date('2026-04-10T10:00:00Z'), arrivalTime: new Date('2026-04-10T15:30:00Z'),
    price: 450, features: ['WiFi', 'TV', 'İkram'], seats: generateSeats(40, [3, 7, 12, 18, 25])
  },
  {
    company: 'Metro Turizm', type: 'bus', origin: 'İstanbul', destination: 'Ankara',
    departureTime: new Date('2026-04-10T12:00:00Z'), arrivalTime: new Date('2026-04-10T18:00:00Z'),
    price: 400, features: ['İkram'], seats: generateSeats(40, [1, 2, 5, 8])
  },
  {
    company: 'Pamukkale', type: 'bus', origin: 'İzmir', destination: 'Antalya',
    departureTime: new Date('2026-04-11T09:00:00Z'), arrivalTime: new Date('2026-04-11T16:00:00Z'),
    price: 550, features: ['WiFi', 'Geniş Koltuk', 'İkram'], seats: generateSeats(30, [10, 11, 20])
  },
  {
    company: 'THY', type: 'flight', origin: 'İstanbul', destination: 'İzmir',
    departureTime: new Date('2026-04-12T08:00:00Z'), arrivalTime: new Date('2026-04-12T09:15:00Z'),
    price: 1800, features: ['Bagaj 15kg', 'İkram'], seats: generateSeats(150, [10,20,30,40,50,60,70])
  },
  {
    company: 'Pegasus', type: 'flight', origin: 'Ankara', destination: 'Antalya',
    departureTime: new Date('2026-04-12T14:30:00Z'), arrivalTime: new Date('2026-04-12T15:40:00Z'),
    price: 1200, features: ['Bagaj 15kg'], seats: generateSeats(180, [5, 15, 25, 35, 45, 55])
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
    await seedTripsIfEmpty();

    const { origin, destination, tripDate, type } = req.query;
    let query = {};

    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (type) query.type = type.toLowerCase();

    if (tripDate) {
      const startOfDay = new Date(tripDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(tripDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.departureTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const results = await Trip.find(query).sort({ departureTime: 1 });

    const mappedResults = results.map(t => {
      const tripObj = t.toObject();
      const availableSeats = tripObj.seats.filter(s => s.status === 'available').length;
      return {
        id: tripObj._id,
        ...tripObj,
        seats: undefined, // Koltuk listesini arama sonucunda gönderme
        availableSeats,
        totalSeats: tripObj.seats.length
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
