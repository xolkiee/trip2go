const createTrip = (req, res) => {
  // Geçici süreliğine veritabanı olmadan dummy (sahte) yanıt dönüyoruz.
  const { departure, destination, date, time, price, totalSeats } = req.body;

  // Gelen veriyi kontrol ederek basit bir doğrulama yapabiliriz.
  if (!departure || !destination || !date || !price || !totalSeats) {
    return res.status(400).json({
      success: false,
      message: 'Lütfen tüm zorunlu alanları doldurun (departure, destination, date, price, totalSeats).'
    });
  }

  // Başarılı bir şekilde eklendiğine dair sahte sefer nesnesi
  const newTrip = {
    _id: 'dummy_id_' + Date.now().toString(),
    departure,
    destination,
    date,
    time: time || '12:00',
    price,
    totalSeats,
    availableSeats: totalSeats,
    createdAt: new Date()
  };

  return res.status(201).json({
    success: true,
    message: 'Sefer başarıyla oluşturuldu (Dummy Data)',
    data: newTrip
  });
};

module.exports = {
  createTrip
};

const updateTrip = (req, res) => {
  const { id } = req.params;
  const { departure, destination, date, time, price, totalSeats } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Lütfen güncellenecek seferin kimliğini (ID) belirtin.'
    });
  }

  // Başarılı bir şekilde güncellendiğine dair sahte sefer nesnesi
  const updatedTrip = {
    _id: id,
    departure: departure || 'İstanbul',
    destination: destination || 'Ankara',
    date: date || '2026-04-01',
    time: time || '14:00',
    price: price || 300,
    totalSeats: totalSeats || 40,
    availableSeats: totalSeats || 40,
    updatedAt: new Date()
  };

  return res.status(200).json({
    success: true,
    message: 'Sefer başarıyla güncellendi (Dummy Data)',
    data: updatedTrip
  });
};

module.exports = {
  createTrip,
  updateTrip
};
