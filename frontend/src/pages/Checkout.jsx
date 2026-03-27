import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const { id: reservationId } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // Varsayılan 10 dk
  const [processing, setProcessing] = useState(false);

  const [passengers, setPassengers] = useState([]);

  // Payment States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const token = localStorage.getItem('trip2go_token');
        const res = await fetch(`http://localhost:5000/api/reservations/${reservationId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setReservation(data.data);
          
          let initialPassengers = data.data.seats.map(seat => ({
            seatNumber: seat,
            passengerInfo: { firstName: '', lastName: '', identityNumber: '', contactPhone: '' }
          }));

          const userStr = localStorage.getItem('trip2go_user');
          if (userStr) {
             try {
                const user = JSON.parse(userStr);
                if (user?.name && initialPassengers.length > 0) {
                   const parts = user.name.split(' ');
                   initialPassengers[0].passengerInfo.firstName = parts[0];
                   if (parts.length > 1) {
                      initialPassengers[0].passengerInfo.lastName = parts.slice(1).join(' ');
                   }
                }
             } catch(e) {}
          }
          setPassengers(initialPassengers);
          const expiresAt = new Date(data.data.expiresAt).getTime();
          const now = new Date().getTime();
          const diffSeconds = Math.floor((expiresAt - now) / 1000);
          
          if (diffSeconds <= 0) {
            setErrorMsg("Rezervasyon süreniz doldu. Lütfen tekrar koltuk seçiniz.");
            setTimeLeft(0);
          } else {
            setTimeLeft(diffSeconds);
          }
        } else {
          setErrorMsg(data.message || 'Rezervasyon bulunamadı veya süresi geçmiş.');
          setTimeLeft(0);
        }
      } catch (err) {
        setErrorMsg('Sunucuya bağlanılamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [reservationId]);

  const handlePassengerChange = (index, field, value) => {
    const newPass = [...passengers];
    newPass[index].passengerInfo[field] = value;
    setPassengers(newPass);
  };

  const handleIdentityChange = (index, rawVal) => {
    handlePassengerChange(index, 'identityNumber', rawVal.replace(/\D/g, ''));
  };

  const handlePhoneChange = (index, rawVal) => {
    let currentVal = passengers[index].passengerInfo.contactPhone;
    if (currentVal.length > rawVal.length && currentVal.endsWith(' ') && !rawVal.endsWith(' ')) {
       rawVal = rawVal.slice(0, -1);
    }
    let val = rawVal.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 3 && val.length <= 6) {
      formatted = `${val.slice(0,4)} ${val.slice(4)}`;
    } else if (val.length > 6 && val.length <= 8) {
      formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7)}`;
    } else if (val.length > 8) {
      formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7,9)} ${val.slice(9)}`;
    }
    handlePassengerChange(index, 'contactPhone', formatted);
  };

  const handleCardNumberChange = (e) => {
    let rawVal = e.target.value;
    if (cardNumber.length > rawVal.length && cardNumber.endsWith(' ') && !rawVal.endsWith(' ')) {
       rawVal = rawVal.slice(0, -1);
    }
    
    let val = rawVal.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    setCardNumber(val.match(/.{1,4}/g)?.join(' ') || val);
  };

  const handleExpiryChange = (e) => {
    let rawVal = e.target.value;
    if (expiry.length > rawVal.length && expiry.endsWith('/') && !rawVal.endsWith('/')) {
       rawVal = rawVal.slice(0, -1);
    }

    let val = rawVal.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      let month = parseInt(val.slice(0,2));
      if (month > 12) val = '12' + val.slice(2);
      if (month === 0) val = '01' + val.slice(2);
    }
    setExpiry(val.length > 2 ? `${val.slice(0,2)}/${val.slice(2)}` : val);
  };

  const handleCvvChange = (e) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0,3));
  };

  // Sayaç mantığı
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          setErrorMsg("Rezervasyon süreniz doldu. Koltuğunuz serbest bırakıldı.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setErrorMsg("Süre dolduğu için ödeme alınamıyor.");
      return;
    }
    
    setProcessing(true);
    setErrorMsg('');

    try {
      const payload = {
        tripId: reservation.trip._id,
        passengers,
        price: reservation.trip.price
      };

      const token = localStorage.getItem('trip2go_token');
      const res = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        // Sepetteki tekil rezervasyon nesnesi TicketController içinde temizlendi
        // Şimdi profil sekmesine (geçmiş biletlere) veya başarılı sayfasına yönlendirelim
        navigate('/my-trips');
      } else {
        setErrorMsg(data.message || 'Ödeme reddedildi.');
        setProcessing(false);
      }
    } catch(err) {
      setErrorMsg("Satın alma işlemi başarısız oldu.");
      setProcessing(false);
    }
  };

  const handleCancelClick = async () => {
    try {
      const token = localStorage.getItem('trip2go_token');
      await fetch(`http://localhost:5000/api/reservations/${reservationId}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
    navigate(-1);
  };

  if (loading) return <div className="checkout-loading"><div className="spinner">Yükleniyor...</div></div>;
  if (!reservation && !errorMsg) return <div className="checkout-loading">Rezervasyon yüklenemedi.</div>;

  return (
    <div className="checkout-page container">
      <div className="checkout-header">
        <h1>Güvenli Ödeme</h1>
        <div className={`timer-badge ${timeLeft < 120 ? 'danger' : ''}`}>
          <span>Kalan Süre: </span>
          <strong>{formatTime(timeLeft)}</strong>
        </div>
      </div>

      {errorMsg ? (
        <div className="checkout-error-panel">
          <div className="alert-error" style={{padding: '2rem', fontSize: '1.2rem'}}>{errorMsg}</div>
          <button className="back-btn-large" onClick={() => navigate(-1)}>Seferlere Dön</button>
        </div>
      ) : (
        <form className="checkout-grid" onSubmit={handleCheckout}>
          <div className="checkout-left">
            
            <div className="checkout-section">
              <h2>1. Yolcu Bilgileri</h2>
              {passengers.map((p, idx) => (
                <div key={p.seatNumber} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <h3 style={{ marginBottom: '15px', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                    Yolcu {idx + 1} (Koltuk {p.seatNumber})
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ad</label>
                      <input type="text" value={p.passengerInfo.firstName} onChange={e => handlePassengerChange(idx, 'firstName', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Soyad</label>
                      <input type="text" value={p.passengerInfo.lastName} onChange={e => handlePassengerChange(idx, 'lastName', e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>T.C. Kimlik / Pasaport No</label>
                      <input type="text" maxLength="11" placeholder="11 Haneli TCKN" value={p.passengerInfo.identityNumber} onChange={e => handleIdentityChange(idx, e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>İletişim Numarası</label>
                      <input type="tel" placeholder="0555 555 55 55" maxLength="15" value={p.passengerInfo.contactPhone} onChange={e => handlePhoneChange(idx, e.target.value)} required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-section">
              <h2>2. Ödeme Bilgileri</h2>
              <p className="payment-note">Sistem test aşamasındadır. Rastgele kart bilgileri girebilirsiniz.</p>
              <div className="form-group full-width">
                <label>Kart Numarası</label>
                <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={cardNumber} onChange={handleCardNumberChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Son Kullanma Tarihi</label>
                  <input type="text" placeholder="AA/YY" maxLength="5" value={expiry} onChange={handleExpiryChange} required />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="text" placeholder="123" maxLength="3" value={cvv} onChange={handleCvvChange} required />
                </div>
              </div>
            </div>

            <div className="checkout-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelClick} disabled={processing}>İptal Et ve Geri Dön</button>
            </div>

          </div>

          <div className="checkout-right">
             <div className="card summary-card sticky">
                <h2 className="card-title">Sipariş Özeti</h2>
                <div className="summary-trip-details">
                   <div className="s-row"><strong>Güzergah:</strong> {reservation.trip.origin} - {reservation.trip.destination}</div>
                   <div className="s-row"><strong>Firma:</strong> {reservation.trip.company}</div>
                   <div className="s-row"><strong>Koltuklar:</strong> {reservation.seats.join(', ')} ({reservation.seats.length} Adet)</div>
                   <div className="s-row"><strong>Tarih:</strong> {new Date(reservation.trip.departureTime).toLocaleDateString()}</div>
                </div>
                
                <hr className="divider" />
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Bilet Fiyatı Toplamı</span>
                    <span>{reservation.trip.price * reservation.seats.length} ₺</span>
                  </div>
                  <div className="price-row">
                    <span>Hizmet Bedeli Toplamı</span>
                    <span>{25 * reservation.seats.length} ₺</span>
                  </div>
                  <div className="price-total">
                    <span>Ödenecek Tutar</span>
                    <span className="total-amount">{(reservation.trip.price + 25) * reservation.seats.length} ₺</span>
                  </div>
                </div>

                <button type="submit" className="book-action-btn" disabled={processing || timeLeft <= 0}>
                  {processing ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
                </button>
             </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Checkout;
