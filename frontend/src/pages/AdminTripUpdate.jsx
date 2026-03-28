import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminTripCreate.css'; // Aynı stilleri kullanıyoruz

const AdminTripUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    departure: '',
    destination: '',
    date: '',
    time: '',
    arrivalTime: '',
    price: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${'https://trip2go-rho.vercel.app'}/api/trips/${id}/details`);
        const data = await res.json();
        if (data.success && data.data) {
          const trip = data.data;
          const depDate = new Date(trip.departureTime);
          const arrDate = new Date(trip.arrivalTime);
          
          setFormData({
            departure: trip.origin,
            destination: trip.destination,
            price: trip.price,
            date: depDate.toISOString().split('T')[0],
            time: depDate.toTimeString().split(' ')[0].substring(0,5),
            arrivalTime: arrDate.toTimeString().split(' ')[0].substring(0,5)
          });
        }
      } catch (err) {
        console.error("Sefer bilgisi alınamadı:", err);
      }
    };
    fetchTripDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${'https://trip2go-rho.vercel.app'}/api/admin/trips/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('trip2go_token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ type: 'success', message: 'Sefer başarıyla güncellendi!' });
      } else {
        setStatus({ type: 'error', message: result.message || 'Sefer güncellenirken bir hata oluştu.' });
      }
    } catch (error) {
      console.error("API Error:", error);
      setStatus({ type: 'error', message: 'Sunucuya bağlanılamadı. Lütfen backendin çalıştığından emin olun.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-container">
          <h1 className="logo"><span>Trip<span>2Go</span></span> <span className="admin-badge">Admin Paneli</span></h1>
        </div>
      </header>
      
      <main className="admin-main">
        <div className="form-card">
          <div className="card-header">
            <h2>Sefer Bilgisini Güncelle</h2>
            <p>Sistemdeki mevcut bir seferi düzenliyorsunuz. (ID: {id})</p>
          </div>
          
          <div className="card-body">
            {status.message && (
              <div className={`alert alert-${status.type}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="trip-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departure">Kalkış Yeri</label>
                  <input type="text" id="departure" name="departure" value={formData.departure} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="destination">Varış Yeri</label>
                  <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Tarih</label>
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Saat</label>
                  <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Bilet Fiyatı (₺)</label>
                  <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" required />
                </div>
                <div className="form-group">
                  <label htmlFor="arrivalTime">Varış Saati</label>
                  <input type="time" id="arrivalTime" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="submit-btn" style={{ backgroundColor: '#6c757d' }} onClick={() => navigate('/admin/trips/new')}>
                   Vazgeç ve Yeni Ekle
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTripUpdate;
