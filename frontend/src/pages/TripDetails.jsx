import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TripDetails.css';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reserving, setReserving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [myReservation, setMyReservation] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sadece okuma amaçlı (Ekleme MyTrips içerisine taşınıyor)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Backend'den detayları çek (Henüz bağlı değilse hata fırlatabilir, fallback düşünebiliriz ama şimdilik try/catch işler)
        const tRes = await fetch(`http://localhost:5000/api/trips/${id}/details`);
        const tData = await tRes.json();
        
        if (tData.success) {
           setTrip(tData.data);
        }

        // Check active reservation
        const token = localStorage.getItem('trip2go_token');
        if (token) {
           const userStr = localStorage.getItem('trip2go_user');
           if (userStr) {
               try {
                  const user = JSON.parse(userStr);
                  if (user.role === 'admin') setIsAdmin(true);
               } catch(e) {}
           }

           const rRes = await fetch(`http://localhost:5000/api/reservations/user/active/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
           });
           const rData = await rRes.json();
           if (rData.success) {
              setMyReservation(rData.data);
              setSelectedSeats(rData.data.seats || []);
           }
        }
      } catch (err) {
        console.error("Detaylar alınamadı", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (isAdmin) {
        setErrorMsg('Yönetici hesapları bilet satın alamaz.');
        return;
    }
    if (myReservation) {
        setErrorMsg('Mevcut bir rezervasyonunuz var, koltuk değiştirmek için sepetten iptal etmelisiniz.');
        return;
    }
    if (seat.status !== 'available') return;
    setErrorMsg('');
    
    if (selectedSeats.includes(seat.seatNumber)) {
        setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
        if (selectedSeats.length >= 5) {
            setErrorMsg('En fazla 5 koltuk seçebilirsiniz.');
            return;
        }
        setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const handleReserve = async () => {
    const token = localStorage.getItem('trip2go_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    setReserving(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tripId: id, seats: selectedSeats })
      });

      const data = await response.json();

      if (data.success) {
         // Rezervasyon kimliği (ObjectId) üzerinden ödeme sayfasına atla
         navigate(`/checkout/${data.data._id}`);
      } else {
         setErrorMsg(data.message || 'Koltuk rezerve edilemedi.');
         setReserving(false);
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası oluştu.');
      setReserving(false);
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
                <div className={`seats-grid layout-${trip.seatLayout ? trip.seatLayout.replace('+', '-') : '2-2'}`}>
                  {trip.seats && trip.seats.map((seat) => {
                    const isMyReservation = myReservation?.seats?.includes(seat.seatNumber);
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isAvailable = seat.status === 'available' || isMyReservation;
                    
                    return (
                      <div 
                        key={seat.seatNumber}
                        className={`seat ${isAvailable ? (isMyReservation ? 'selected' : (isSelected ? 'selected' : 'available')) : (seat.status === 'reserved' ? 'reserved' : 'occupied')}`}
                        onClick={() => handleSeatClick(seat)}
                        title={isAvailable ? (isMyReservation ? `Koltuk ${seat.seatNumber} - Sizin Rezerve Ettiğiniz Koltuk` : `Koltuk ${seat.seatNumber} - Boş`) : (seat.status === 'reserved' ? `Koltuk ${seat.seatNumber} - Rezerve Edilmiş` : `Koltuk ${seat.seatNumber} - Dolu`)}
                      >
                        {seat.seatNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
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
                <span>Birim Bilet Tutarı</span>
                <span>{trip.price} ₺</span>
              </div>
              <div className="price-row">
                <span>Birim Hizmet Bedeli</span>
                <span>{trip.price * 0.05} ₺</span>
              </div>
              <div className="price-row highlight">
                <span>Seçili Koltuklar</span>
                <span>{selectedSeats.length > 0 ? selectedSeats.sort((a,b)=>a-b).join(', ') : '-'}</span>
              </div>
              
              <div className="price-total">
                <span>Toplam Tutar</span>
                <span className="total-amount">{selectedSeats.length > 0 ? (trip.price + (trip.price * 0.05)) * selectedSeats.length : 0} ₺</span>
              </div>
            </div>

            {myReservation && (
                <div className="alert" style={{marginBottom: '15px', padding: '10px', borderRadius: '5px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'}}>
                    <strong>Koltuk {myReservation.seats.join(',')} sizin adınıza rezerve!</strong> Kalan süreniz bitmeden ödemeyi tamamlayabilirsiniz.
                </div>
            )}
            {errorMsg && <div className="alert-error" style={{marginBottom: '10px'}}>{errorMsg}</div>}

            <button 
               className="book-action-btn" 
               disabled={isAdmin || selectedSeats.length === 0 || reserving}
               onClick={myReservation ? () => navigate(`/checkout/${myReservation._id}`) : handleReserve}
            >
              {isAdmin ? 'Yöneticiler Satın Alamaz' : (myReservation ? 'Ödemeye Devam Et' : (!localStorage.getItem('trip2go_token') ? 'Satın Almak için Giriş Yapın' : (reserving ? 'Kilitleniyor...' : (selectedSeats.length > 0 ? 'Ödemeye İlerle' : 'Lütfen Koltuk Seçin'))))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
