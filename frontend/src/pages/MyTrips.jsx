import React, { useState, useEffect } from 'react';
import './MyTrips.css';

const MyTrips = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});

  const [activeReviewTripId, setActiveReviewTripId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('trip2go_user');
        const user = userStr ? JSON.parse(userStr) : { firstName: 'Misafir', lastName: 'Kullanıcı' };
        const userId = `${user.firstName} ${user.lastName}`; 

        const tRes = await fetch('http://localhost:5000/api/trips/search');
        const tData = await tRes.json();
        
        if (tData.success && tData.data.length >= 2) {
          // Geçmiş tarihli bilet
          const pastTrip = { ...tData.data[0] };
          const pastArrival = new Date();
          pastArrival.setHours(pastArrival.getHours() - 5);
          pastTrip.arrivalTime = pastArrival.toISOString();
          pastTrip.departureTime = new Date(pastArrival.getTime() - 2*60*60*1000).toISOString();
          
          // Gelecek tarihli bilet
          const futureTrip = { ...tData.data[1] };
          const futureArrival = new Date();
          futureArrival.setDate(futureArrival.getDate() + 2);
          futureTrip.arrivalTime = futureArrival.toISOString();
          futureTrip.departureTime = new Date(futureArrival.getTime() - 2*60*60*1000).toISOString();

          const myRes = [pastTrip, futureTrip];
          setReservations(myRes);

          // Var olan yorumları test et
          for (const trip of myRes) {
            const rRes = await fetch(`http://localhost:5000/api/reviews/trip/${trip.id}`);
            const rData = await rRes.json();
            if (rData.success) {
              const userReview = rData.data.find(r => r.userId === userId);
              if (userReview) {
                setReviews(prev => ({ ...prev, [trip.id]: userReview }));
              }
            }
          }
        }
      } catch (err) {
        console.error("Seyahatlerim alınamadı", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenReview = (tripId, existingReview = null) => {
    setActiveReviewTripId(tripId);
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const userStr = localStorage.getItem('trip2go_user');
    const user = userStr ? JSON.parse(userStr) : { firstName: 'Misafir', lastName: 'Kullanıcı' };
    const userId = `${user.firstName} ${user.lastName}`; 
    
    const existingReview = reviews[activeReviewTripId];
    try {
      if (existingReview) {
        const res = await fetch(`http://localhost:5000/api/reviews/${existingReview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, comment })
        });
        const data = await res.json();
        if (data.success) {
          setReviews(prev => ({ ...prev, [activeReviewTripId]: data.data }));
          setActiveReviewTripId(null);
        } else alert(data.message);
      } else {
        const res = await fetch(`http://localhost:5000/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId: activeReviewTripId, userId, rating, comment })
        });
        const data = await res.json();
        if(data.success) {
          setReviews(prev => ({ ...prev, [activeReviewTripId]: data.data }));
          setActiveReviewTripId(null);
        } else alert(data.message);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (tripId) => {
    if(!window.confirm("Bu değerlendirmeyi silmek istediğinize emin misiniz?")) return;
    
    const reviewId = reviews[tripId].id;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if(data.success) {
        const newReviews = {...reviews};
        delete newReviews[tripId];
        setReviews(newReviews);
        if(activeReviewTripId === tripId) setActiveReviewTripId(null);
      }
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading" style={{textAlign: 'center', padding: '50px'}}>Yükleniyor...</div>;

  const now = new Date();

  return (
    <div className="my-trips-page">
      <div className="my-trips-header">
        <h1>Seyahatlerim</h1>
        <p>Satın aldığınız biletlerin detaylarını ve geçmiş seferlerinizi görüntüleyin.</p>
        <div className="dev-notice">
          <strong>⚠️ Geliştirici Deneme Paneli:</strong> Henüz rezervasyon altyapısı (Furkan'ın Yetki Alanı) bağlanmadığı için burada her kullanıcı için örnek biri tamamlanmış diğeri planlanmış 2 sahte bilet listelenmektedir. Yorum sistemini (Değerlendir/Düzenle/Sil) bu tamamlanmış sefer üzerinden %100 test edebilirsiniz.
        </div>
      </div>

      <div className="my-trips-container">
        {reservations.length === 0 ? (
          <div className="no-trips">Bulunan biletiniz yok.</div>
        ) : (
          reservations.map(trip => {
            const isCompleted = new Date(trip.arrivalTime) < now;
            const userReview = reviews[trip.id];
            
            return (
              <div key={trip.id} className="trip-history-card">
                <div className="trip-history-top">
                  <div>
                    <span className="route-title">{trip.origin} → {trip.destination}</span>
                    <span className="route-date">{new Date(trip.departureTime).toLocaleDateString()} - {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`status-badge ${isCompleted ? 'completed' : 'pending'}`}>
                    {isCompleted ? 'Sefer Tamamlandı' : 'Sefer Bekleniyor'}
                  </div>
                </div>

                <div className="trip-history-actions">
                  {!isCompleted ? (
                    <p className="wait-msg">Seferiniz tamamlandığında bu seferi puanlayabilirsiniz.</p>
                  ) : (
                    <div className="review-action-area">
                      {userReview ? (
                         <div className="my-rating-display">
                           <strong>Puanınız:</strong> <span style={{color: '#f59e0b'}}>{'★'.repeat(userReview.rating)}{'☆'.repeat(5-userReview.rating)}</span>
                           <p style={{fontStyle: 'italic', marginTop: '10px'}}>{userReview.comment}</p>
                           <div className="review-action-btns">
                              <button onClick={() => handleOpenReview(trip.id, userReview)} className="edit-btn">Düzenle</button>
                              <button onClick={() => handleDeleteReview(trip.id)} className="delete-btn">Sil</button>
                           </div>
                         </div>
                      ) : (
                        <button onClick={() => handleOpenReview(trip.id)} className="rate-btn">
                          Seferi Değerlendir
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Yorum Formu (Açılırsa) */}
                {activeReviewTripId === trip.id && (
                  <form className="inline-review-form" onSubmit={handleSubmitReview}>
                    <h4>{userReview ? 'Değerlendirmeyi Güncelle' : 'Yolculuğunuz nasıldı?'}</h4>
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                      <option value={5}>5 Yıldız - Mükemmel</option>
                      <option value={4}>4 Yıldız - Çok İyi</option>
                      <option value={3}>3 Yıldız - Orta</option>
                      <option value={2}>2 Yıldız - Kötü</option>
                      <option value={1}>1 Yıldız - Çok Kötü</option>
                    </select>
                    <textarea 
                      placeholder="Görüşleriniz bizim için değerli..." 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required 
                      rows={3}
                    />
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setActiveReviewTripId(null)}>İptal</button>
                      <button type="submit" className="save-btn">{userReview ? 'Güncelle' : 'Gönder'}</button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyTrips;
