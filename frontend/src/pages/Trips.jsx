import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Trips.css';

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || ''); // Blur olduğunda eski seçimi geri yükle
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // Türkçe karakter hatalarını (I-ı, İ-i) düzelten yardımcı toLowerCase
  const trToLowerCase = (str) => {
    return str.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
  };

  const filteredOptions = options.filter(opt => 
    trToLowerCase(opt.name).includes(trToLowerCase(searchTerm))
  );

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <input 
        type="text"
        className="select-display-input"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={(e) => {
          e.target.select();
          setIsOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="select-dropdown">
          <ul className="select-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li 
                  key={opt.id} 
                  onMouseDown={(e) => e.preventDefault()} // engellemezsek input focus kaybeder
                  onClick={() => {
                    onChange(opt.name);
                    setSearchTerm(opt.name);
                    setIsOpen(false);
                  }}
                  className={value === opt.name ? 'selected' : ''}
                >
                  {opt.name}
                </li>
              ))
            ) : (
              <li className="no-options">Kayıt bulunamadı.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search parameters - sessionStorage ile kalıcılık sağlanıyor
  const [origin, setOrigin] = useState(sessionStorage.getItem('trip2go_origin') || '');
  const [destination, setDestination] = useState(sessionStorage.getItem('trip2go_dest') || '');
  const [tripDate, setTripDate] = useState(sessionStorage.getItem('trip2go_date') || '');
  const [searchedDate, setSearchedDate] = useState(''); // Aramaya basıldığındaki tarihi tutar
  const [type, setType] = useState(sessionStorage.getItem('trip2go_type') || 'bus'); // 'bus' veya 'flight'

  const navigate = useNavigate();

  // JavaScript ile bugünün tarihini YYYY-MM-DD formatında al
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // API'den binlerce İl/İlçe/Havalimanı verisini çek
    const fetchLocations = async () => {
      try {
        const res = await fetch('https://trip2go-rho.vercel.app/api/locations');
        const data = await res.json();
        if (data.success) {
          setLocations(data.data);
        }
      } catch (err) {
        console.error("Şehirler yüklenemedi", err);
      }
    };
    fetchLocations();
  }, []);

  // Tip değiştikçe origin ve destination'ı sıfırla ki Otobüs'teyken seçili Uçak havalimanı kalmasın
  const handleTypeChange = (newType) => {
    setType(newType);
    setOrigin('');
    setDestination('');
    sessionStorage.setItem('trip2go_type', newType);
    sessionStorage.removeItem('trip2go_origin');
    sessionStorage.removeItem('trip2go_dest');
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSearchedDate(tripDate); // Aramanın yapıldığı o anki tarihi sabitle

    // Arama yapıldığı an verileri SessionStorage'a kaydet (Sayfa yenilense / geri dönülse bile kalsın)
    sessionStorage.setItem('trip2go_origin', origin);
    sessionStorage.setItem('trip2go_dest', destination);
    sessionStorage.setItem('trip2go_date', tripDate);
    sessionStorage.setItem('trip2go_type', type);

    try {
      const queryParams = new URLSearchParams();
      if (origin) queryParams.append('origin', origin);
      if (destination) queryParams.append('destination', destination);
      if (tripDate) queryParams.append('tripDate', tripDate);
      if (type) queryParams.append('type', type);

      const res = await fetch(`https://trip2go-rho.vercel.app/api/trips/search?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Seferler alınırken hata oluştu.');
      
      setTrips(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dinamik placeholder ve konum filtreleme mantığı
  const filteredLocations = locations.filter(loc => loc.type === (type === 'bus' ? 'city' : 'airport'));
  const placeholderText = type === 'bus' ? 'İl veya İlçe Seçin' : 'Havalimanı Seçin';

  return (
    <div className="trips-page-container">
      {/* Modern Yatay Arama Çubuğu (Hero Section) */}
      <div className="search-hero">
        <div className="search-hero-content">
          <h1 className="hero-title">Yolculuğa Nereye Başlayalım?</h1>
          
          <div className="search-tabs">
            <button 
              type="button" 
              className={`search-tab ${type === 'bus' ? 'active' : ''}`}
              onClick={() => handleTypeChange('bus')}
            >
              Otobüs Bileti
            </button>
            <button 
              type="button" 
              className={`search-tab ${type === 'flight' ? 'active' : ''}`}
              onClick={() => handleTypeChange('flight')}
            >
              Uçak Bileti
            </button>
          </div>

          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-fields-row">
              <div className="search-input-group border-right" style={{ position: 'relative' }}>
                <label>Kalkış Noktası</label>
                <SearchableSelect 
                  value={origin} 
                  onChange={(val) => setOrigin(val)} 
                  options={filteredLocations} 
                  placeholder={locations.length === 0 ? 'Yükleniyor...' : placeholderText} 
                />

                <div className="switch-icon-wrapper">
                  <button type="button" className="switch-icon" onClick={() => {
                     const temp = origin; setOrigin(destination); setDestination(temp);
                  }}>
                    ⇆
                  </button>
                </div>
              </div>

              <div className="search-input-group border-right padding-left">
                <label>Varış Noktası</label>
                <SearchableSelect 
                  value={destination} 
                  onChange={(val) => setDestination(val)} 
                  options={filteredLocations} 
                  placeholder={locations.length === 0 ? 'Yükleniyor...' : placeholderText} 
                />
              </div>

              <div className="search-input-group padding-left">
                <label>Gidiş Tarihi</label>
                <input 
                  type="date" 
                  value={tripDate} 
                  onChange={(e) => setTripDate(e.target.value)}
                  min={today} 
                />
              </div>

              <button type="submit" className="search-submit-btn">
                Bilet Bul
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sonuç Listesi */}
      <div className="results-container">
        {loading ? (
          <div className="loading-spinner">Yükleniyor...</div>
        ) : error ? (
          <div className="alert alert-error" style={{maxWidth: '1000px', margin: '0 auto'}}>{error}</div>
        ) : trips.length > 0 ? (
          <div className="trips-list">
            <h2 className="results-title">{trips.length} Sefer Bulundu</h2>
            
            {trips.map(trip => (
              <div key={trip.id} className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)}>
                <div className="trip-card-left">
                  <div className="trip-company-name">
                     {trip.company}
                     <div style={{fontSize: '0.85rem', color: '#f59e0b', marginTop: '4px', fontWeight: 'bold'}}>
                        {trip.ratingInfo ? `⭐ ${trip.ratingInfo.avg} (${trip.ratingInfo.count} Değerlendirme)` : '⭐ Puanlanmamış'}
                     </div>
                  </div>
                  <div className="trip-features">
                    {trip.features?.map((f, i) => <span key={i} className="feature-badge">{f}</span>)}
                  </div>
                </div>
                
                <div className="trip-card-middle">
                  <div className="timeline-section">
                    <div className="timeline-point">
                      <span className="time">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="station">{trip.origin}</span>
                    </div>
                    <div className="timeline-bar">
                      <span className="duration-icon">{trip.type === 'flight' ? '✈️' : '🚌'}</span>
                      <div className="line"></div>
                    </div>
                    <div className="timeline-point">
                      <span className="time">{new Date(trip.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="station">{trip.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="trip-card-right">
                  <div className="price">{trip.price} <small>TL</small></div>
                  <div className="seats-info">{trip.availableSeats} Koltuk Boş</div>
                  <button className="book-btn">Seç</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results-card">
            <h3>Üzgünüz, {searchedDate ? `${searchedDate} tarihindeki` : ''} kriterlerinize uygun sefer bulunamadı.</h3>
            <p>Farklı bir tarih veya güzergah deneyebilirsiniz!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
