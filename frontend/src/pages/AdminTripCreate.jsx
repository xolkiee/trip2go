import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminTripCreate.css';

// Reuse SearchableSelect from Trips.jsx to maintain consistency
const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || '');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const trToLowerCase = (str) => {
    return str.replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase();
  };

  const filteredOptions = options.filter(opt => 
    trToLowerCase(opt.name).includes(trToLowerCase(searchTerm))
  );

  return (
    <div className="searchable-select" ref={wrapperRef} style={{ width: '100%', position: 'relative' }}>
      <input 
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={(e) => {
          e.target.select();
          setIsOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem'
        }}
      />
      
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
          border: '1px solid #ddd', zIndex: 1000, maxHeight: '200px', overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '6px', marginTop: '4px'
        }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li 
                  key={opt.id} 
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt.name);
                    setSearchTerm(opt.name);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '10px 15px', cursor: 'pointer',
                    backgroundColor: value === opt.name ? '#f1f5f9' : 'transparent',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  {opt.name}
                </li>
              ))
            ) : (
              <li style={{ padding: '10px 15px', color: '#888' }}>Kayıt bulunamadı.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};


const AdminTripCreate = () => {
  // LocalStorage'dan admin yetki sınırlarını çekiyoruz
  const storedUserStr = localStorage.getItem('trip2go_user');
  let adminCompany = '';
  let adminType = 'bus'; // default fallback
  
  if (storedUserStr) {
    try {
      const userObj = JSON.parse(storedUserStr);
      if (userObj.companyName) adminCompany = userObj.companyName;
      if (userObj.companyType) adminType = userObj.companyType;
    } catch (e) { }
  }

  const [formData, setFormData] = useState({
    company: adminCompany || '',
    type: adminType || 'bus',
    seatLayout: adminType === 'flight' ? 'flight' : '2+1', // typea göre default layout
    departure: '',
    destination: '',
    date: '',
    time: '',
    arrivalTime: '',
    price: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [createdTripId, setCreatedTripId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // API'den iller ve havalimanları çekiliyor
    const fetchLocations = async () => {
      try {
        const res = await fetch(('https://trip2go-rho.vercel.app') + '/api/locations');
        const data = await res.json();
        if (data.success) {
          setLocations(data.data);
        }
      } catch (err) {
        console.error("Şehirler yüklenemedi", err);
      }
    };

    const fetchMyTrips = async () => {
      try {
        const token = localStorage.getItem('trip2go_token');
        if(!token) return setLoadingTrips(false);
        const res = await fetch(('https://trip2go-rho.vercel.app') + '/api/admin/trips', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setMyTrips(data.data);
      } catch (err) {
        console.error("Seferler yüklenemedi", err);
      } finally {
        setLoadingTrips(false);
      }
    };
    
    fetchLocations();
    fetchMyTrips();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bu seferi yayından kaldırmak istediğinize emin misiniz?")) return;
    try {
      const token = localStorage.getItem('trip2go_token');
      const res = await fetch(`${'https://trip2go-rho.vercel.app'}/api/admin/trips/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyTrips(prev => prev.filter(t => t._id !== id));
      } else {
        alert(data.message || 'Silinemedi');
      }
    } catch(err) {
      console.error(err);
      alert('Sunucu hatası');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: newType,
      departure: '',
      destination: '',
      seatLayout: newType === 'bus' ? '2+1' : 'flight'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    setCreatedTripId(null);

    // Final payload fix (uçak seçildiyse seatLayout arka planda ignored olsun)
    const payload = { ...formData };
    if (payload.type === 'flight') payload.seatLayout = 'flight';

    try {
      const token = localStorage.getItem('trip2go_token');
      const response = await fetch(('https://trip2go-rho.vercel.app') + '/api/admin/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus({ type: 'success', message: 'Sefer başarıyla oluşturuldu!' });
        setCreatedTripId(result.data?._id || 'dummy_id');
        setFormData({
            company: adminCompany || '',
            type: adminType || 'bus',
            seatLayout: adminType === 'flight' ? 'flight' : '2+1',
            departure: '',
            destination: '',
            date: '',
            time: '',
            arrivalTime: '',
            price: ''
        });
        
        // Yeni ekleneni tabloya da düşürmek için tekrar fetchle
        const checkRes = await fetch(('https://trip2go-rho.vercel.app') + '/api/admin/trips', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const checkData = await checkRes.json();
        if (checkData.success) setMyTrips(checkData.data);
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

  // Type a göre lokasyon filtrele
  const filteredLocations = locations.filter(loc => loc.type === (formData.type === 'bus' ? 'city' : 'airport'));
  const placeholderText = formData.type === 'bus' ? 'İl/İlçe Seçin' : 'Havalimanı Seçin';

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
              </div>
            )}

            <form onSubmit={handleSubmit} className="trip-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">Firma Adı</label>
                  <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Örn: Kamil Koç, THY" required readOnly={!!adminCompany} style={adminCompany ? {backgroundColor: '#e2e8f0', color: '#475569', cursor: 'not-allowed'} : {}} />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Taşıt Türü</label>
                  <select id="type" name="type" value={formData.type} onChange={handleTypeChange} required disabled={!!adminType} style={adminType ? {backgroundColor: '#e2e8f0', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', color: '#475569', cursor: 'not-allowed'} : {padding: '12px', borderRadius: '6px', border: '1px solid #ddd'}}>
                    <option value="bus">Otobüs</option>
                    <option value="flight">Uçak</option>
                  </select>
                </div>
                
                {formData.type === 'bus' && (
                  <div className="form-group">
                    <label htmlFor="seatLayout">Koltuk Düzeni Seçimi</label>
                    <select id="seatLayout" name="seatLayout" value={formData.seatLayout} onChange={handleChange} required style={{backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '12px', borderRadius: '6px'}}>
                      <option value="2+1">2+1 Düzen (40 Koltuk)</option>
                      <option value="2+2">2+2 Standart Düzen (44 Koltuk)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row" style={{ zIndex: 10 }}>
                <div className="form-group">
                  <label>Kalkış Noktası</label>
                  <SearchableSelect 
                    value={formData.departure} 
                    onChange={(val) => handleLocationChange('departure', val)} 
                    options={filteredLocations} 
                    placeholder={locations.length === 0 ? 'Yükleniyor...' : placeholderText} 
                  />
                </div>
                <div className="form-group">
                  <label>Varış Noktası</label>
                  <SearchableSelect 
                    value={formData.destination} 
                    onChange={(val) => handleLocationChange('destination', val)} 
                    options={filteredLocations} 
                    placeholder={locations.length === 0 ? 'Yükleniyor...' : placeholderText} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Tarih</label>
                  <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Kalkış Saati</label>
                  <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="arrivalTime">Varış Saati</label>
                  <input type="time" id="arrivalTime" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Bilet Fiyatı (₺)</label>
                  <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="Örn: 250" min="0" required />
                </div>
                <div className="form-group">
                   {/* Buraya artık boş bir div koyabiliriz form esnekliğini sürdürmek için */}
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

        <div className="form-card" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <div className="card-header">
            <h2>Yönettiğiniz Seferler</h2>
            <p>Sisteme sizin tarafınızdan eklenen seferler listelenmektedir.</p>
          </div>
          <div className="card-body" style={{ overflowX: 'auto' }}>
            {loadingTrips ? <p>Yükleniyor...</p> : myTrips.length === 0 ? <p>Henüz bir sefer eklemediniz.</p> : (
              <table className="trips-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Firma</th>
                    <th>Tür</th>
                    <th>Rota</th>
                    <th>Tarih/Saat</th>
                    <th>Fiyat</th>
                    <th style={{ textAlign: 'right', padding: '12px' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {myTrips.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{t.company}</td>
                      <td>{t.type === 'flight' ? 'Uçak' : 'Otobüs'}</td>
                      <td><strong>{t.origin}</strong> → <strong>{t.destination}</strong></td>
                      <td>{new Date(t.departureTime).toLocaleDateString('tr-TR')} {new Date(t.departureTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</td>
                      <td><span style={{color:'var(--primary-orange)', fontWeight:'bold'}}>{t.price} ₺</span></td>
                      <td style={{ textAlign: 'right', padding: '12px' }}>
                         <button 
                           onClick={() => navigate(`/admin/trips/${t._id}/edit`)}
                           style={{ padding: '6px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                           Düzenle
                         </button>
                         <button 
                           onClick={() => handleDelete(t._id)} 
                           style={{ marginLeft: '10px', padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                           Sil
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTripCreate;
