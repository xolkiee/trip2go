const Location = require('../models/Location');

// Kapsamlı Havalimanı Listesi
const majorAirports = [
  { name: 'İstanbul Havalimanı (IST)', code: 'IST' },
  { name: 'İstanbul Sabiha Gökçen Havalimanı (SAW)', code: 'SAW' },
  { name: 'Antalya Havalimanı (AYT)', code: 'AYT' },
  { name: 'Ankara Esenboğa Havalimanı (ESB)', code: 'ESB' },
  { name: 'İzmir Adnan Menderes Havalimanı (ADB)', code: 'ADB' },
  { name: 'Adana Havalimanı (ADA)', code: 'ADA' },
  { name: 'Trabzon Havalimanı (TZX)', code: 'TZX' },
  { name: 'Muğla Dalaman Havalimanı (DLM)', code: 'DLM' },
  { name: 'Muğla Milas-Bodrum Havalimanı (BJV)', code: 'BJV' },
  { name: 'Gaziantep Oğuzeli Havalimanı (GZT)', code: 'GZT' },
  { name: 'Kayseri Erkilet Havalimanı (ASR)', code: 'ASR' },
  { name: 'Diyarbakır Havalimanı (DIY)', code: 'DIY' },
  { name: 'Van Ferit Melen Havalimanı (VAN)', code: 'VAN' },
  { name: 'Erzurum Havalimanı (ERZ)', code: 'ERZ' },
  { name: 'Hatay Havalimanı (HTY)', code: 'HTY' },
  { name: 'Konya Havalimanı (KYA)', code: 'KYA' },
  { name: 'Ordu Giresun Havalimanı (OGU)', code: 'OGU' },
  { name: 'Samsun-Çarşamba Havalimanı (SZF)', code: 'SZF' },
  { name: 'Elazığ Havalimanı (EZS)', code: 'EZS' },
  { name: 'Malatya Erhaç Havalimanı (MLX)', code: 'MLX' },
  { name: 'Şanlıurfa GAP Havalimanı (GNY)', code: 'GNY' },
  { name: 'Antalya Gazipaşa Havalimanı (GZP)', code: 'GZP' },
  { name: 'Denizli Çardak Havalimanı (DNZ)', code: 'DNZ' },
  { name: 'Mardin Havalimanı (MQM)', code: 'MQM' },
  { name: 'Kars Havalimanı (KSY)', code: 'KSY' },
  { name: 'Sivas Havalimanı (VAS)', code: 'VAS' },
  { name: 'Batman Havalimanı (BAL)', code: 'BAL' },
  { name: 'Erzincan Havalimanı (ERC)', code: 'ERC' },
  { name: 'Muş Havalimanı (MSR)', code: 'MSR' },
  { name: 'Balıkesir Koca Seyit Havalimanı (EDO)', code: 'EDO' },
  { name: 'Şırnak Havalimanı (NKT)', code: 'NKT' },
  { name: 'Kahramanmaraş Havalimanı (KCM)', code: 'KCM' },
  { name: 'Ağrı Havalimanı (AJI)', code: 'AJI' },
  { name: 'Adıyaman Havalimanı (ADF)', code: 'ADF' },
  { name: 'Bursa Yenişehir Havalimanı (YEI)', code: 'YEI' },
  { name: 'Iğdır Havalimanı (IGD)', code: 'IGD' },
  { name: 'Amasya Merzifon Havalimanı (MZH)', code: 'MZH' },
  { name: 'Çanakkale Havalimanı (CKZ)', code: 'CKZ' },
  { name: 'Isparta Süleyman Demirel Havalimanı (ISE)', code: 'ISE' },
  { name: 'Bingöl Havalimanı (BGG)', code: 'BGG' },
  { name: 'Hakkari Yüksekova Havalimanı (YKO)', code: 'YKO' },
  { name: 'Sinop Havalimanı (SIC)', code: 'SIC' },
  { name: 'Nevşehir Kapadokya Havalimanı (NAV)', code: 'NAV' },
  { name: 'Tekirdağ Çorlu Havalimanı (TEQ)', code: 'TEQ' },
  { name: 'Kütahya Zafer Havalimanı (KZR)', code: 'KZR' },
  { name: 'Kastamonu Havalimanı (KFS)', code: 'KFS' },
  { name: 'Eskişehir Anadolu Havalimanı (AOE)', code: 'AOE' },
  { name: 'Kocaeli Cengiz Topel Havalimanı (KCO)', code: 'KCO' },
  { name: 'Zonguldak Havalimanı (ONQ)', code: 'ONQ' },
  { name: 'Siirt Havalimanı (SXZ)', code: 'SXZ' },
  { name: 'Tokat Havalimanı (TJK)', code: 'TJK' },
  { name: 'Uşak Havalimanı (USQ)', code: 'USQ' },
  { name: 'Balıkesir Havalimanı (BZI)', code: 'BZI' },
  { name: 'Çanakkale Gökçeada Havalimanı (GKD)', code: 'GKD' }
];

const seedLocationsIfEmpty = async () => {
    try {
        // En hızlı kontrol: Veritabanında herhangi bir lokasyon var mı?
        // Bu sorgu milisaniyeler sürer ve 10s timeout riskini ortadan kaldırır.
        const exists = await Location.findOne().select('_id');
        
        // Eğer veritabanında en az bir tane lokasyon varsa seed işlemine girme
        if(exists) return;

        console.log("Veritabanı boş, lokasyonlar (Havalimanları ve İller) veritabanına ekleniyor...");
        let seedData = [];
        
        // Havalimanlarını hazır listeden ekle
        majorAirports.forEach(airport => {
            seedData.push({ type: 'airport', name: airport.name, code: airport.code });
        });

        // TürkiyeAPI üzerinden 81 İl ve İlçeleri çek
        try {
            const res = await fetch('https://turkiyeapi.dev/api/v1/provinces');
            if(res.ok) {
                const parsed = await res.json();
                parsed.data.forEach(province => {
                    seedData.push({ type: 'city', name: province.name, code: province.id.toString() });
                    if (province.districts && Array.isArray(province.districts)) {
                        province.districts.forEach(district => {
                            seedData.push({ 
                                type: 'city', 
                                name: `${province.name} - ${district.name}`, 
                                code: `${province.id}-${district.id}` 
                            });
                        });
                    }
                });
            }
        } catch (apiError) {
            console.error("Dış API'den lokasyon çekilirken hata (Havalimanları ile devam ediliyor):", apiError);
        }
        
        if(seedData.length > 0) {
            // Veri fazlalığı durumunda MongoDB Atlas'ı yormamak için toplu kayıt
            await Location.insertMany(seedData);
            console.log("Lokasyonlar başarıyla Mongoose üzerine eklendi!");
        }
    } catch(err) {
        console.error("Location seed hatası:", err);
    }
};

// @desc    Tüm şehir, ilçe ve havalimanı lokasyonlarını getirir
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    // Sadece bir kere DB'ye seed (tohumlama) yapılır
    await seedLocationsIfEmpty();

    const locations = await Location.find();
    
    // Frontend'in kolay kullanımı için id formatını maple
    const mapped = locations.map(loc => {
        const obj = loc.toObject();
        return { id: obj._id.toString(), ...obj };
    });

    res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped
    });

  } catch (error) {
    console.error('Get Locations Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  getLocations
};
