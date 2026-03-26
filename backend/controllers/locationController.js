// @desc    Tüm şehir ve havalimanı lokasyonlarını getirir
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const locations = [
      { id: '1', type: 'city', name: 'İstanbul', code: 'IST' },
      { id: '2', type: 'city', name: 'Ankara', code: 'ANK' },
      { id: '3', type: 'city', name: 'İzmir', code: 'IZM' },
      { id: '4', type: 'city', name: 'Antalya', code: 'ANT' },
      { id: '5', type: 'airport', name: 'İstanbul Havalimanı', code: 'IST' },
      { id: '6', type: 'airport', name: 'Sabiha Gökçen Havalimanı', code: 'SAW' },
      { id: '7', type: 'airport', name: 'Esenboğa Havalimanı', code: 'ESB' },
      { id: '8', type: 'airport', name: 'Adnan Menderes Havalimanı', code: 'ADB' }
    ];

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });

  } catch (error) {
    console.error('Get Locations Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  getLocations
};
