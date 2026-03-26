// Dummy Trips Data
const dummyTrips = [
  {
    id: 't1',
    company: 'Kamil Koç',
    type: 'bus',
    origin: 'İstanbul',
    destination: 'Ankara',
    departureTime: '2026-04-10T10:00:00',
    arrivalTime: '2026-04-10T15:30:00',
    price: 450,
    features: ['WiFi', 'TV', 'İkram'],
    seats: generateSeats(40, [3, 7, 12, 18, 25]) // 40 koltuklu, bazıları dolu
  },
  {
    id: 't2',
    company: 'Metro Turizm',
    type: 'bus',
    origin: 'İstanbul',
    destination: 'Ankara',
    departureTime: '2026-04-10T12:00:00',
    arrivalTime: '2026-04-10T18:00:00',
    price: 400,
    features: ['İkram'],
    seats: generateSeats(40, [1, 2, 5, 8])
  },
  {
    id: 't3',
    company: 'Pamukkale',
    type: 'bus',
    origin: 'İzmir',
    destination: 'Antalya',
    departureTime: '2026-04-11T09:00:00',
    arrivalTime: '2026-04-11T16:00:00',
    price: 550,
    features: ['WiFi', 'Geniş Koltuk', 'İkram'],
    seats: generateSeats(30, [10, 11, 20])
  },
  {
    id: 't4',
    company: 'THY',
    type: 'flight',
    origin: 'İstanbul',
    destination: 'İzmir',
    departureTime: '2026-04-12T08:00:00',
    arrivalTime: '2026-04-12T09:15:00',
    price: 1800,
    features: ['Bagaj 15kg', 'İkram'],
    seats: generateSeats(150, Array.from({length: 40}, () => Math.floor(Math.random() * 150) + 1))
  },
  {
    id: 't5',
    company: 'Pegasus',
    type: 'flight',
    origin: 'Ankara',
    destination: 'Antalya',
    departureTime: '2026-04-12T14:30:00',
    arrivalTime: '2026-04-12T15:40:00',
    price: 1200,
    features: ['Bagaj 15kg'],
    seats: generateSeats(180, Array.from({length: 80}, () => Math.floor(Math.random() * 180) + 1))
  }
];

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

// @desc    Seferleri arar ve filtreler
// @route   GET /api/trips/search
// @access  Public
const searchTrips = async (req, res) => {
  try {
    const { origin, destination, tripDate, type } = req.query;
    
    // Basit bir filtreleme mantığı (tarihleri string includes veya exact match ile yapabiliriz)
    let results = [...dummyTrips];

    if (origin) {
      results = results.filter(t => t.origin.toLowerCase().includes(origin.toLowerCase()));
    }
    
    if (destination) {
      results = results.filter(t => t.destination.toLowerCase().includes(destination.toLowerCase()));
    }

    if (type) {
      results = results.filter(t => t.type.toLowerCase() === type.toLowerCase());
    }

    // Seçilen tarihteki seferleri bul (sadece YYYY-MM-DD olarak kısmi eşleşme)
    if (tripDate) {
      results = results.filter(t => t.departureTime.startsWith(tripDate));
    }

    // Arama sonuçlarında tüm koltuk objesini döndürmeye gerek yok, sadece kapasite bilgisini verelim.
    const mappedResults = results.map(t => {
      const { seats, ...tripData } = t;
      const availableSeats = seats.filter(s => s.status === 'available').length;
      return {
        ...tripData,
        availableSeats,
        totalSeats: seats.length
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
    const tripId = req.params.id;
    const trip = dummyTrips.find(t => t.id === tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Sefer bulunamadı.' });
    }

    res.status(200).json({
      success: true,
      data: trip
    });

  } catch (error) {
    console.error('Get Trip Details Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  searchTrips,
  getTripDetails
};
