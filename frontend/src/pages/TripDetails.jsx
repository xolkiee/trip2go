import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Trips.css'; // Reusing some glass-panel styles
import './TripDetails.css';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Focus for review posting
  const [postRating, setPostRating] = useState(5);
  const [postComment, setPostComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch trip details
        const tRes = await fetch(`http://localhost:5000/api/trips/${id}/details`);
        const tData = await tRes.json();
        
        // Fetch reviews
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
    
    // Allow only one seat selection for this mock
    if (selectedSeat === seat.seatNumber) {
      setSelectedSeat(null); // Deselect
    } else {
      setSelectedSeat(seat.seatNumber);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      // Mock logic holding a dummy user since Auth state might not perfectly exist in this test env.
      const userId = 'GezginUser123'; 
      
      const res = await fetch(`http://localhost:5000/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId: id, userId, rating: postRating, comment: postComment })
      });
      const data = await res.json();
      if(data.success) {
        setReviews([...reviews, data.data]);
        setPostComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="trips-page-container"><div className="loader">Yükleniyor...</div></div>;
  if (!trip) return <div className="trips-page-container"><div className="error-alert">Sefer bulunamadı.</div></div>;

  return (
    <div className="trips-page-container" style={{backgroundColor: '#f1f5f9'}}>
      <div className="trip-details-container">
        <div className="details-header">
          <button onClick={() => navigate(-1)} className="tab-btn" style={{marginBottom: '20px'}}>← Geri Dön</button>
          <h1 className="details-title">{trip.origin} - {trip.destination} ({trip.company})</h1>
          <p>{new Date(trip.departureTime).toLocaleDateString()} | {trip.type === 'flight' ? 'Uçuş' : 'Otobüs'}</p>
        </div>

        <div className="split-layout">
          <div className="left-panel">
            
            <div className="info-card glass-panel">
              <h2>Koltuk Seçimi</h2>
              <p style={{color:'#64748b', marginTop:'5px'}}>Lütfen seyahat etmek istediğiniz koltuğu seçin.</p>
              
              <div className="seat-map-wrapper">
                <div className="seat-grid-bus">
                  {trip.seats.map((seat, index) => {
                    // Create aisle gap logic for a 2+2 layout
                    const rem = index % 4;
                    const items = [];
                    if(rem === 2) items.push(<div key={`aisle-${index}`} className="aisle"></div>);

                    items.push(
                      <div 
                        key={seat.seatNumber}
                        className={`seat-btn 
                          ${seat.status === 'available' ? 'seat-available' : 'seat-occupied'} 
                          ${selectedSeat === seat.seatNumber ? 'seat-selected' : ''}`
                        }
                        onClick={() => handleSeatClick(seat)}
                        title={seat.status === 'occupied' ? 'Dolu' : 'Boş'}
                      >
                        {seat.seatNumber}
                      </div>
                    );

                    return items;
                  })}
                </div>
              </div>
            </div>

            <div className="info-card glass-panel reviews-section">
              <h3>Yolcu Değerlendirmeleri ({reviews.length})</h3>
              
              <div className="review-list">
                {reviews.length === 0 ? <p>Henüz yorum yapılmamış.</p> : reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-header">
                      <strong>Kullanıcı: {r.userId}</strong>
                      <span className="review-rating">★ {r.rating}/5</span>
                    </div>
                    <p style={{color: '#475569'}}>{r.comment}</p>
                  </div>
                ))}
              </div>

              <form className="add-review-form" onSubmit={handleAddReview}>
                <h4 style={{marginTop:'15px'}}>Yorum Ekle</h4>
                <div style={{display:'flex', gap:'10px'}}>
                  <select value={postRating} onChange={e=>setPostRating(Number(e.target.value))} style={{padding:'10px', borderRadius:'8px', border:'1px solid #cbd5e1'}}>
                    <option value={5}>5 Yıldız</option>
                    <option value={4}>4 Yıldız</option>
                    <option value={3}>3 Yıldız</option>
                    <option value={2}>2 Yıldız</option>
                    <option value={1}>1 Yıldız</option>
                  </select>
                  <input type="text" placeholder="Görüşleriniz..." required value={postComment} onChange={e=>setPostComment(e.target.value)} style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #cbd5e1'}} />
                  <button type="submit" className="search-submit-btn" style={{height:'100%'}}>Gönder</button>
                </div>
              </form>
            </div>

          </div>

          <div className="right-panel">
            <div className="summary-card glass-panel">
              <h2 className="summary-title">Özet</h2>
              
              <div className="summary-row">
                <span>Bilet Tutarı</span>
                <span>{trip.price} ₺</span>
              </div>
              <div className="summary-row">
                <span>Hizmet Bedeli</span>
                <span>{trip.price * 0.05} ₺</span>
              </div>
              <div className="summary-row">
                <span>Seçili Koltuk</span>
                <span style={{fontWeight:'bold', color:'#6366f1'}}>
                  {selectedSeat ? selectedSeat : '-'}
                </span>
              </div>
              
              <div className="summary-row summary-total">
                <span>Toplam</span>
                <span>{trip.price + (trip.price * 0.05)} ₺</span>
              </div>

              <button className="checkout-btn" disabled={!selectedSeat}>
                {selectedSeat ? 'Ödemeye Geç' : 'Koltuk Seçin'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
