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
  const [editPassenger, setEditPassenger] = useState({ firstName: '', lastName: '', identityNumber: '', contactPhone: '' });

  const handleEditIdentityChange = (rawVal) => {
    setEditPassenger(prev => ({ ...prev, identityNumber: rawVal.replace(/\D/g, '') }));
  };

  const handleEditPhoneChange = (rawVal) => {
    let currentVal = editPassenger.contactPhone;
    if (currentVal.length > rawVal.length && currentVal.endsWith(' ') && !rawVal.endsWith(' ')) {
       rawVal = rawVal.slice(0, -1);
    }
    let val = rawVal.replace(/\D/g, '');
    if (val.length > 0 && val[0] !== '0') val = '0' + val;
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 3 && val.length <= 6) {
      formatted = `${val.slice(0,4)} ${val.slice(4)}`;
    } else if (val.length > 6 && val.length <= 8) {
      formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7)}`;
    } else if (val.length > 8) {
      formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7,9)} ${val.slice(9)}`;
    }
    setEditPassenger(prev => ({ ...prev, contactPhone: formatted }));
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('trip2go_token');
      if(!token) return;
      
      const userStr = localStorage.getItem('trip2go_user');
      const user = userStr ? JSON.parse(userStr) : { firstName: 'Misafir', lastName: 'Kullanıcı' };
      const userId = `${user.firstName} ${user.lastName}`; 

      const tRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users/profile', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const tData = await tRes.json();
      
      if (tRes.ok && tData.tickets) {
        setTickets(tData.tickets);

        // Var olan yorumları test et (Sadece benzersiz seferler için yapabiliriz ama basitçe döngüyle de olur)
        const uniqueTrips = [...new Set(tData.tickets.filter(t => t.trip).map(t => t.trip._id))];
        for (const tripId of uniqueTrips) {
          const rRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/trip/${tripId}`);
          const rData = await rRes.json();
          if (rData.success) {
            const userReview = rData.data.find(r => r.userId === userId && r.tripId === tripId);
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

  const handleDeleteReview = async (tripId, reviewId) => {
    if (!window.confirm("Yorumunuzu kalıcı olarak silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('trip2go_token')}` }
      });
      if (res.ok) {
        const newReviews = {...reviews};
        delete newReviews[tripId];
        setReviews(newReviews);
        alert("Yorum başarıyla silindi.");
      }
    } catch(err) {
      console.error(err);
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${existingReview.id}`, {
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/${ticketId}`, {
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
    if (editPassenger.identityNumber.length !== 11) {
        alert("Lütfen 11 haneli T.C. Kimlik numarasını eksiksiz giriniz.");
        return;
    }
    if (editPassenger.contactPhone.length < 14) {
        alert("Lütfen geçerli bir telefon numarası giriniz (örn: 05xx xxx xx xx).");
        return;
    }
    try {
       const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tickets/${ticketId}/passenger`, {
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

  const groupedTrips = tickets.reduce((groups, ticket) => {
     if (!ticket.trip) return groups;
     const tripId = ticket.trip._id;
     if (!groups[tripId]) {
        groups[tripId] = { trip: ticket.trip, tickets: [] };
     }
     groups[tripId].tickets.push(ticket);
     return groups;
  }, {});

  const tripGroupsArray = Object.values(groupedTrips).sort((a,b) => new Date(b.trip.departureTime) - new Date(a.trip.departureTime));

  return (
    <div className="my-trips-page">
      <div className="my-trips-header">
        <h1>Seyahatlerim</h1>
        <p>Satın aldığınız biletlerin detaylarını, koltuk numaralarınızı ve geçmiş seferlerinizi görüntüleyin.</p>
      </div>

      <div className="my-trips-container">
        {tripGroupsArray.length === 0 ? (
          <div className="no-trips">Bulunan biletiniz yok.</div>
        ) : (
          tripGroupsArray.map(group => {
            const trip = group.trip;
            const groupTickets = group.tickets;

            // Grup genel durumu: Tüm biletler iptal mi?
            const allCancelled = groupTickets.every(t => t.status === 'cancelled');
            
            const isCompleted = new Date(trip.arrivalTime) <= now && !allCancelled;
            const isPending = new Date(trip.departureTime) > now && !allCancelled;
            const isInProgress = new Date(trip.departureTime) <= now && new Date(trip.arrivalTime) > now && !allCancelled;
            const userReview = reviews[trip._id];

            return (
              <div key={trip._id} className={`trip-history-card ${allCancelled ? 'cancelled-card' : ''}`}>
                <div className="trip-history-top">
                  <div>
                    <span className="route-title">{trip.company} | {trip.origin} → {trip.destination}</span>
                    <span className="route-date">{new Date(trip.departureTime).toLocaleDateString()} - {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`status-badge ${allCancelled ? 'danger' : isCompleted ? 'completed' : (isInProgress ? 'completed' : 'pending')}`} style={isInProgress ? {backgroundColor: '#eab308', color: '#fff'} : {}}>
                    {allCancelled ? 'Tüm Biletler İptal Edildi' : (isCompleted ? 'Sefer Tamamlandı' : (isInProgress ? 'Sefer Gerçekleşiyor' : 'Sefer Bekleniyor'))}
                  </div>
                </div>

                {/* Yolcu/Bilet Listesi */}
                <div className="group-tickets-list" style={{ marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                   <h4 style={{ marginBottom: '10px', color: '#334155' }}>Yolcu Bilgileri</h4>
                   {groupTickets.map(ticket => {
                      const isTicketCancelled = ticket.status === 'cancelled';
                      return (
                         <div key={ticket._id} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '10px', backgroundColor: isTicketCancelled ? '#fef2f2' : '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ fontSize: '0.95rem', color: '#475569' }}>
                               <strong>Yolcu:</strong> {ticket.passenger?.firstName} {ticket.passenger?.lastName} | <strong>Koltuk No:</strong> {ticket.seatNumber}
                               {isTicketCancelled && <span style={{marginLeft: '10px', color: '#ef4444', fontWeight: 'bold'}}>(İptal Edildi)</span>}
                            </div>
                            
                            {!isTicketCancelled && isPending && (
                               <div className="ticket-mgmt-actions" style={{ display: 'flex', gap: '8px' }}>
                                  <button className="rate-btn" style={{backgroundColor: '#3b82f6', padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => {
                                     setEditTicketId(ticket._id);
                                     setEditPassenger({ 
                                        firstName: ticket.passenger?.firstName || '', 
                                        lastName: ticket.passenger?.lastName || '',
                                        identityNumber: ticket.passenger?.identityNumber || '',
                                        contactPhone: ticket.passenger?.contactPhone || ''
                                     });
                                  }}>Güncelle</button>
                                  <button className="rate-btn" style={{backgroundColor: '#ef4444', padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => handleCancelTicket(ticket._id)}>İptal Et</button>
                               </div>
                            )}

                            {editTicketId === ticket._id && (
                               <div style={{ width: '100%', flexBasis: '100%', marginTop: '10px' }}>
                                  <form onSubmit={(e) => submitPassengerEdit(e, ticket._id)} style={{background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                     <h5 style={{marginBottom: '10px', color: '#1e293b', fontSize: '0.95rem'}}>Bilgileri Güncelle</h5>
                                     <div style={{display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap'}}>
                                        <div style={{flex: 1, minWidth: '45%'}}>
                                          <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#64748b'}}>Ad</label>
                                          <input type="text" value={editPassenger.firstName} onChange={e => setEditPassenger({...editPassenger, firstName: e.target.value})} style={{width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px'}} required />
                                        </div>
                                        <div style={{flex: 1, minWidth: '45%'}}>
                                          <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#64748b'}}>Soyad</label>
                                          <input type="text" value={editPassenger.lastName} onChange={e => setEditPassenger({...editPassenger, lastName: e.target.value})} style={{width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px'}} required />
                                        </div>
                                        <div style={{flex: 1, minWidth: '45%'}}>
                                          <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#64748b'}}>T.C. Kimlik / Pasaport</label>
                                          <input type="text" maxLength="11" placeholder="11 Haneli TCKN" value={editPassenger.identityNumber} onChange={e => handleEditIdentityChange(e.target.value)} style={{width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px'}} required />
                                        </div>
                                        <div style={{flex: 1, minWidth: '45%'}}>
                                          <label style={{display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: '#64748b'}}>İletişim Numarası</label>
                                          <input type="tel" maxLength="15" placeholder="0555 555 55 55" value={editPassenger.contactPhone} onChange={e => handleEditPhoneChange(e.target.value)} style={{width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px'}} required />
                                        </div>
                                     </div>
                                     <div style={{display: 'flex', gap: '10px'}}>
                                        <button type="submit" className="save-btn" style={{padding: '6px 12px', fontSize: '0.85rem'}}>Kaydet</button>
                                        <button type="button" className="cancel-btn" style={{padding: '6px 12px', fontSize: '0.85rem'}} onClick={() => setEditTicketId(null)}>Vazgeç</button>
                                     </div>
                                  </form>
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>

                <div className="trip-history-actions" style={{borderTop: '1px solid #e2e8f0', marginTop: '10px', paddingTop: '15px'}}>
                   {!isCompleted && !allCancelled && !isPending ? null : (
                     isCompleted ? (
                       <div className="review-action-area">
                         {userReview ? (
                            <div className="my-rating-display">
                              <strong>Puanınız:</strong> <span style={{color: '#f59e0b'}}>{'★'.repeat(userReview.rating)}{'☆'.repeat(5-userReview.rating)}</span>
                              <p style={{fontStyle: 'italic', marginTop: '10px'}}>{userReview.comment}</p>
                              <div className="review-action-btns" style={{display: 'flex', gap: '10px'}}>
                                 <button onClick={() => handleOpenReview(trip._id, userReview)} className="edit-btn">Yorumu Düzenle</button>
                                 <button onClick={() => handleDeleteReview(trip._id, userReview.id)} className="cancel-btn">Yorumu Sil</button>
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
