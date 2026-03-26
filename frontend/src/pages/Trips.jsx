import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Trips.css';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search parameters
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [type, setType] = useState('bus'); // 'bus' or 'flight'

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch locations for autocomplete/select options
    const fetchLocations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/locations');
        const data = await res.json();
        if (data.success) {
          setLocations(data.data);
        }
      } catch (err) {
        console.error("Şehirler yüklenemedi", err);
      }
    };
    fetchLocations();
    handleSearch(); // Initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      if (origin) queryParams.append('origin', origin);
      if (destination) queryParams.append('destination', destination);
      if (tripDate) queryParams.append('tripDate', tripDate);
      if (type) queryParams.append('type', type);

      const res = await fetch(`http://localhost:5000/api/trips/search?${queryParams.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Seferler alınırken hata oluştu.');
      
      setTrips(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trips-page-container">
      {/* Premium Hero Search Banner */}
      <div className="search-hero">
        <div className="hero-content">
          <h1 className="hero-title">Yolculuğa Nereye Başlayalım?</h1>
          <p className="hero-subtitle">Hayalindeki tatili bulmak için hemen arama yap.</p>
          
          <form className="search-box glass-panel" onSubmit={handleSearch}>
            <div className="search-tabs">
              <button 
                type="button" 
                className={`tab-btn ${type === 'bus' ? 'active' : ''}`}
                onClick={() => setType('bus')}
              >
                🚌 Otobüs Bileti
              </button>
              <button 
                type="button" 
                className={`tab-btn ${type === 'flight' ? 'active' : ''}`}
                onClick={() => setType('flight')}
              >
                ✈️ Uçak Bileti
              </button>
            </div>

            <div className="search-fields">
              <div className="field-group">
                <label>Nereden</label>
                <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
                  <option value="">Şehir Seçin</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>Nereye</label>
                <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                  <option value="">Şehir Seçin</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>Gidiş Tarihi</label>
                <input 
                  type="date" 
                  value={tripDate} 
                  onChange={(e) => setTripDate(e.target.value)} 
                />
              </div>

              <button type="submit" className="search-submit-btn">
                Sefer Bul
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-container">
        {loading ? (
          <div className="loader">Yükleniyor...</div>
        ) : error ? (
          <div className="error-alert">{error}</div>
        ) : trips.length > 0 ? (
          <div className="trips-list">
            <h2 className="results-title">Arama Sonuçları ({trips.length} Sefer Bulundu)</h2>
            {trips.map(trip => (
              <div key={trip.id} className="trip-card glass-panel" onClick={() => navigate(`/trips/${trip.id}`)}>
                <div className="trip-card-left">
                  <div className="trip-company">{trip.company}</div>
                  <div className="trip-features">
                    {trip.features?.map((f, i) => <span key={i} className="feature-badge">{f}</span>)}
                  </div>
                </div>
                
                <div className="trip-card-middle">
                  <div className="timeline">
                    <div className="time-block">
                      <div className="time">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="station">{trip.origin}</div>
                    </div>
                    <div className="timeline-line">
                      <span className="duration-icon">{trip.type === 'flight' ? '✈️' : '🚌'}</span>
                    </div>
                    <div className="time-block">
                      <div className="time">{new Date(trip.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="station">{trip.destination}</div>
                    </div>
                  </div>
                </div>

                <div className="trip-card-right">
                  <div className="price">{trip.price} ₺</div>
                  <div className="seats-info">{trip.availableSeats} Boş Koltuk</div>
                  <button className="book-btn">Seç ve İlerle</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results glass-panel">
            <h3>Üzgünüz, kriterlerinize uygun sefer bulunamadı.</h3>
            <p>Farklı bir tarih veya güzergah deneyebilirsiniz!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
