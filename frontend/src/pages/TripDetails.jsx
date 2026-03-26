import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripDetails.css';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Sadece okuma amaçlı (Ekleme MyTrips içerisine taşınıyor)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Backend'den detayları çek (Henüz bağlı değilse hata fırlatabilir, fallback düşünebiliriz ama şimdilik try/catch işler)
        const tRes = await fetch(`http://localhost:5000/api/trips/${id}/details`);
        const tData = await tRes.json();
        
        const rRes = await fetch(`http://localhost:5000/api/reviews/trip/${id}`);
        const rData = await rRes.json();

        if (tData.success) setTrip(tData.data);
        if (rData.success) setReviews(rData.data);
      } catch (err) {
        console.error("Detaylar alınamadı", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available') return;
    
    if (selectedSeat === seat.seatNumber) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat.seatNumber);
    }
  };

  if (loading) return <div className="trip-loading"><div className="spinner">Yükleniyor...</div></div>;
  if (!trip) return <div className="trip-loading"><div className="alert-error">Sefer bulunamadı.</div></div>;

  return (
    <div className="trip-details-page">
      <div className="details-header-bar">
        <div className="container details-header-content">
          <button onClick={() => navigate(-1)} className="back-btn">← Seferlere Dön</button>
          <div className="trip-main-info">
            <h1>{trip.origin} <span>→</span> {trip.destination}</h1>
            <p>
              {new Date(trip.departureTime).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })} 
              {' | '} 
              {trip.company} 
              {' | '}
              {trip.type === 'flight' ? 'Uçak Seferi' : 'Otobüs Seferi'}
            </p>
          </div>
        </div>
      </div>

      <div className="container details-main-content">
        <div className="left-panel">
          
          <div className="card seat-selection-card">
            <h2 className="card-title">Koltuk Seçimi</h2>
            <p className="card-subtitle">Lütfen seyahat etmek istediğiniz koltuğu seçin.</p>
            
            <div className="seat-map-wrapper">
              <div className="seat-map-legend">
                <span className="legend-item"><div className="seat-box available"></div> Boş</span>
                <span className="legend-item"><div className="seat-box occupied"></div> Dolu</span>
                <span className="legend-item"><div className="seat-box selected"></div> Seçili</span>
              </div>

              <div className="bus-layout">
                <div className="bus-steering">Direksiyon</div>
                <div className="seats-grid">
                  {trip.seats && trip.seats.map((seat, index) => {
                    const isSelected = selectedSeat === seat.seatNumber;
                    const isAvailable = seat.status === 'available';
                    
                    return (
                      <div 
                        key={seat.seatNumber}
                        className={`seat ${isAvailable ? 'available' : 'occupied'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        title={isAvailable ? `Koltuk ${seat.seatNumber} - Boş` : `Koltuk ${seat.seatNumber} - Dolu`}
                      >
                        {seat.seatNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="card reviews-card">
            <h2 className="card-title">Yolcu Değerlendirmeleri ({reviews.length})</h2>
            
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">Bu sefer için henüz değerlendirme yapılmamış. İlk değerlendiren siz olun!</p>
              ) : (
                reviews.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-top">
                      <span className="reviewer-name">{r.userId}</span>
                      <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div className="right-panel">
          <div className="card summary-card sticky">
            <h2 className="card-title">Sefer Özeti</h2>
            
            <div className="summary-details">
              <div className="route-info">
                <div className="route-time">{new Date(trip.departureTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="route-city">{trip.origin}</div>
              </div>
              <div className="route-line"></div>
              <div className="route-info text-right">
                <div className="route-time">{new Date(trip.arrivalTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="route-city">{trip.destination}</div>
              </div>
            </div>

            <hr className="divider" />

            <div className="price-breakdown">
              <div className="price-row">
                <span>Bilet Tutarı</span>
                <span>{trip.price} ₺</span>
              </div>
              <div className="price-row">
                <span>Hizmet Bedeli</span>
                <span>{trip.price * 0.05} ₺</span>
              </div>
              <div className="price-row highlight">
                <span>Seçili Koltuk</span>
                <span>{selectedSeat ? `Koltuk ${selectedSeat}` : '-'}</span>
              </div>
              
              <div className="price-total">
                <span>Toplam Tutar</span>
                <span className="total-amount">{trip.price + (trip.price * 0.05)} ₺</span>
              </div>
            </div>

            <button className="book-action-btn" disabled={!selectedSeat}>
              {selectedSeat ? 'Ödemeye İlerle' : 'Lütfen Koltuk Seçin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
