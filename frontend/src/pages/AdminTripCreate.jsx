import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminTripCreate.css';

const AdminTripCreate = () => {
  const [formData, setFormData] = useState({
    departure: '',
    destination: '',
    date: '',
    time: '',
    price: '',
    totalSeats: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [createdTripId, setCreatedTripId] = useState(null);

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
    setCreatedTripId(null);

    try {
      const response = await fetch('http://localhost:5000/api/admin/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ type: 'success', message: 'Sefer başarıyla oluşturuldu!' });
        setCreatedTripId(result.data?._id || 'dummy_id');
        setFormData({
            departure: '',
            destination: '',
            date: '',
            time: '',
            price: '',
            totalSeats: ''
        });
      } else {
        setStatus({ type: 'error', message: result.message || 'Sefer oluşturulurken bir hata oluştu.' });
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
            <h2>Yeni Sefer Ekle</h2>
            <p>Sisteme yeni bir otobüs veya uçak seferi tanımlayın.</p>
          </div>
          
          <div className="card-body">
            {status.message && (
              <div className={`alert alert-${status.type}`}>
                {status.message}
                {status.type === 'success' && createdTripId && (
                  <div style={{ marginTop: '10px' }}>
                    <Link to={`/admin/trips/${createdTripId}/edit`} style={{ color: '#065f46', fontWeight: 'bold', textDecoration: 'underline' }}>
                      Oluşturulan seferi düzenlemek için tıklayın
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="trip-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departure">Kalkış Yeri</label>
                  <input type="text" id="departure" name="departure" value={formData.departure} onChange={handleChange} placeholder="Örn: İstanbul" required />
                </div>
                <div className="form-group">
                  <label htmlFor="destination">Varış Yeri</label>
                  <input type="text" id="destination" name="destination" value={formData.destination} onChange={handleChange} placeholder="Örn: Ankara" required />
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
                  <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="Örn: 250" min="0" required />
                </div>
                <div className="form-group">
                  <label htmlFor="totalSeats">Toplam Koltuk Sayısı</label>
                  <input type="number" id="totalSeats" name="totalSeats" value={formData.totalSeats} onChange={handleChange} placeholder="Örn: 40" min="1" required />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Ekleniyor...' : 'Sefer Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTripCreate;
