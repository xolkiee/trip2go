import React, { useState, useEffect } from 'react';
import './MyTrips.css';

const MyTrips = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({});

  const [activeReviewTripId, setActiveReviewTripId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Yolcu Güncelleme State
  const [editTicketId, setEditTicketId] = useState(null);
  const [editPassenger, setEditPassenger] = useState({ firstName: '', lastName: '' });

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('trip2go_token');
      if(!token) return;
      
      const userStr = localStorage.getItem('trip2go_user');
      const user = userStr ? JSON.parse(userStr) : { firstName: 'Misafir', lastName: 'Kullanıcı' };
      const userId = `${user.firstName} ${user.lastName}`; 

      const tRes = await fetch('http://localhost:5000/api/users/profile', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const tData = await tRes.json();
      
      if (tRes.ok && tData.tickets) {
        setTickets(tData.tickets);

        // Var olan yorumları test et (Sadece benzersiz seferler için yapabiliriz ama basitçe döngüyle de olur)
        const uniqueTrips = [...new Set(tData.tickets.filter(t => t.trip).map(t => t.trip._id))];
        for (const tripId of uniqueTrips) {
          const rRes = await fetch(`http://localhost:5000/api/reviews/trip/${tripId}`);
          const rData = await rRes.json();
          if (rData.success) {
            const userReview = rData.data.find(r => r.userId === userId);
            if (userReview) {
              setReviews(prev => ({ ...prev, [tripId]: userReview }));
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

  useEffect(() => {
    fetchTickets();
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

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm("Biletinizi iptal etmek istediğinize emin misiniz? İptal edilen biletlerin iadesi yapılamaz.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${localStorage.getItem('trip2go_token')}` }
      });
      if (res.ok) {
         fetchTickets(); // Listeyi yenile
         alert("Bilet başarıyla iptal edildi.");
      }
    } catch(err) {
       console.error(err);
    }
  };

  const submitPassengerEdit = async (e, ticketId) => {
    e.preventDefault();
    try {
       const res = await fetch(`http://localhost:5000/api/tickets/${ticketId}/passenger`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('trip2go_token')}` 
          },
          body: JSON.stringify({ passenger: editPassenger })
       });
       if (res.ok) {
          setEditTicketId(null);
          // fetchTickets() update için bekleyebiliriz ama veriyi hemen aradan setState de yapabiliriz
          fetchTickets();
          alert("Yolcu bilgileri başarıyla güncellendi!");
       } else {
          const d = await res.json(); alert(d.message);
       }
    } catch(err) { console.error(err); }
  }

  if (loading) return <div className="loading" style={{textAlign: 'center', padding: '50px'}}>Yükleniyor...</div>;

  const now = new Date();

  return (
    <div className="my-trips-page">
      <div className="my-trips-header">
        <h1>Seyahatlerim</h1>
        <p>Satın aldığınız biletlerin detaylarını, koltuk numaralarınızı ve geçmiş seferlerinizi görüntüleyin.</p>
      </div>

      <div className="my-trips-container">
        {tickets.length === 0 ? (
          <div className="no-trips">Bulunan biletiniz yok.</div>
        ) : (
          tickets.map(ticket => {
            const trip = ticket.trip;
            if (!trip) return <div key={ticket._id} className="trip-history-card">Sefer silinmiş (Geçersiz Bilet)</div>;

            const isCancelled = ticket.status === 'cancelled';
            const isCompleted = new Date(trip.arrivalTime) <= now && !isCancelled;
            const isPending = new Date(trip.departureTime) > now && !isCancelled;
            const isInProgress = new Date(trip.departureTime) <= now && new Date(trip.arrivalTime) > now && !isCancelled;
            const userReview = reviews[trip._id];
            
            return (
              <div key={ticket._id} className={`trip-history-card ${isCancelled ? 'cancelled-card' : ''}`}>
                <div className="trip-history-top">
                  <div>
                    <span className="route-title">{trip.origin} → {trip.destination}</span>
                    <span className="route-date">{new Date(trip.departureTime).toLocaleDateString()} - {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <div style={{marginTop: '10px', fontSize: '0.95rem', color: '#475569'}}>
                       <strong>Yolcu:</strong> {ticket.passenger?.firstName} {ticket.passenger?.lastName} | <strong>Koltuk No:</strong> {ticket.seatNumber} | <strong>Ücret:</strong> {ticket.price}₺
                    </div>
                  </div>
                  <div className={`status-badge ${isCancelled ? 'danger' : isCompleted ? 'completed' : (isInProgress ? 'completed' : 'pending')}`} style={isInProgress ? {backgroundColor: '#eab308', color: '#fff'} : {}}>
                    {isCancelled ? '❌ Bilet İptal Edildi' : (isCompleted ? 'Sefer Tamamlandı' : (isInProgress ? 'Sefer Gerçekleşiyor' : 'Sefer Bekleniyor'))}
                  </div>
                </div>

                <div className="trip-history-actions" style={{borderTop: '1px solid #e2e8f0', marginTop: '15px', paddingTop: '15px'}}>
                  {isPending && (
                    <div className="ticket-mgmt-actions" style={{ display: 'flex', gap: '10px', marginBottom: '15px'}}>
                       <button className="rate-btn" style={{backgroundColor: '#3b82f6'}} onClick={() => {
                          setEditTicketId(ticket._id);
                           setEditPassenger({ firstName: ticket.passenger?.firstName || '', lastName: ticket.passenger?.lastName || '' });
                       }}>Yolcu Güncelle</button>
                       <button className="rate-btn" style={{backgroundColor: '#ef4444'}} onClick={() => handleCancelTicket(ticket._id)}>Bileti İptal Et</button>
                    </div>
                  )}

                  {/* Yolcu Düzenleme Formu */}
                  {editTicketId === ticket._id && (
                     <form onSubmit={(e) => submitPassengerEdit(e, ticket._id)} style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px'}}>
                        <h4 style={{marginBottom: '10px', color: '#1e293b'}}>Yolcu Bilgilerini Güncelle</h4>
                        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                           <input type="text" value={editPassenger.firstName} onChange={e => setEditPassenger({...editPassenger, firstName: e.target.value})} style={{padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px'}} required />
                           <input type="text" value={editPassenger.lastName} onChange={e => setEditPassenger({...editPassenger, lastName: e.target.value})} style={{padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px'}} required />
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                           <button type="submit" className="save-btn" style={{padding: '8px 16px', fontSize: '0.9rem'}}>Kaydet</button>
                           <button type="button" className="cancel-btn" style={{padding: '8px 16px', fontSize: '0.9rem'}} onClick={() => setEditTicketId(null)}>Vazgeç</button>
                        </div>
                     </form>
                  )}

                  {!isCompleted && !isCancelled && !isPending ? null : (
                    isCompleted ? (
                      <div className="review-action-area">
                        {userReview ? (
                           <div className="my-rating-display">
                             <strong>Puanınız:</strong> <span style={{color: '#f59e0b'}}>{'★'.repeat(userReview.rating)}{'☆'.repeat(5-userReview.rating)}</span>
                             <p style={{fontStyle: 'italic', marginTop: '10px'}}>{userReview.comment}</p>
                             <div className="review-action-btns">
                                <button onClick={() => handleOpenReview(trip._id, userReview)} className="edit-btn">Yorumu Düzenle</button>
                             </div>
                           </div>
                        ) : (
                          <button onClick={() => handleOpenReview(trip._id)} className="rate-btn">
                            Seferi Değerlendir
                          </button>
                        )}
                      </div>
                    ) : null
                  )}
                </div>

                {/* Yorum Formu (Açılırsa) */}
                {activeReviewTripId === trip._id && (
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
