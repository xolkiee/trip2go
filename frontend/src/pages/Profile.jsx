import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('trip2go_token');
  
  // States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [hasActiveTickets, setHasActiveTickets] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          
          if (data.tickets) {
             const active = data.tickets.some(t => t.status === 'active' && new Date(t.trip?.arrivalTime) >= new Date());
             setHasActiveTickets(active);
          }
        } else {
          setErrorMsg(data.message || 'Profil yüklenemedi.');
        }
      } catch (err) {
        setErrorMsg('Sunucu bağlantı hatası.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handlePhoneChange = (e) => {
    let rawVal = e.target.value;
    if (phone.length > rawVal.length && phone.endsWith(' ') && !rawVal.endsWith(' ')) {
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
    setPhone(formatted);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (phone && phone.length < 14) {
       setErrorMsg('Lütfen telefon numarasını eksiksiz giriniz (örn: 05xx xxx xx xx).');
       return;
    }

    setUpdateLoading(true);

    try {
      const payload = { firstName, lastName, phone };
      if (password) payload.password = password;

      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message);
        localStorage.setItem('trip2go_token', data.token); // Yeni Token'ı Set Et
        localStorage.setItem('trip2go_user', JSON.stringify(data.user)); // Yeni Yüzeyi Set Et
        setPassword(''); // Güvenlik için şifre kutusunu sıfırla
      } else {
        setErrorMsg(data.message || 'Güncelleme başarısız.');
      }
    } catch (err) {
      setErrorMsg('Güncelleme sırasında hata oluştu.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users/profile', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        localStorage.removeItem('trip2go_token');
        localStorage.removeItem('trip2go_user');
        alert("Hesabınız ve tüm verileriniz başarıyla silindi.");
        navigate('/login');
      } else {
        const data = await response.json();
        setErrorMsg(data.message || 'Hesap silinemedi.');
        setShowConfirmDelete(false);
      }
    } catch (err) {
      setErrorMsg('Hesap silinirken hata oluştu.');
      setShowConfirmDelete(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><div className="profile-loading">Profil yükleniyor...</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <h2 className="profile-title">Profil Yönetimi</h2>
        
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <div className="profile-content">
          {/* Güncelleme Formu */}
          <div className="profile-card profile-update-card">
            <h3>Kişisel Bilgiler</h3>
            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Ad</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Soyad</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>E-Posta Adresi <span className="text-muted">(Değiştirilemez)</span></label>
                <input type="email" value={email} disabled className="input-disabled" />
              </div>

              <div className="form-group">
                <label>Telefon Numarası</label>
                <input type="tel" maxLength="15" placeholder="Örn: 0555 444 33 22" value={phone} onChange={handlePhoneChange} />
              </div>

              <div className="form-group">
                <label>Yeni Şifre Belirle <span className="text-muted">(Aynı kalması için boş bırakın)</span></label>
                <input type="password" placeholder="Yeni şifrenizi girin..." value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="profile-update-btn" disabled={updateLoading}>
                {updateLoading ? 'Güncelleniyor...' : 'Bilgilerimi Kaydet'}
              </button>
            </form>
          </div>

          {/* Tehlikeli İşlemler */}
          <div className="profile-card profile-danger-card">
            <h3>Hesap Güvenliği</h3>
            <p className="danger-info">
              Hesabınızı silerseniz sisteme ait verileriniz, seyahat geçmişiniz ve platformda yaptığınız tüm yorumlar kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </p>
            
            {hasActiveTickets && (
               <div className="alert alert-error" style={{marginBottom: '15px'}}>
                 <strong>Dikkat!</strong> Şu anda ileri tarihli ve iptal edilmemiş "Aktif" biletleriniz bulunmaktadır. Hesabınızı silmeniz durumunda bu biletler otomatik olarak İPTAL EDİLECEK ve kurallar gereği ücret iadesi YAPILMAYACAKTIR.
               </div>
            )}
            
            {!showConfirmDelete ? (
              <button 
                type="button" 
                className="btn-danger" 
                onClick={() => setShowConfirmDelete(true)}
              >
                Hesabımı Sil
              </button>
            ) : (
              <div className="danger-confirm-box">
                <p><strong>Emin misiniz?</strong> Bu işlem geri alınamaz!</p>
                <div className="danger-actions">
                  <button type="button" className="btn-danger-confirm" onClick={handleDeleteAccount}>
                    Evet, Hesabımı Kalıcı Olarak Sil
                  </button>
                  <button type="button" className="btn-danger-cancel" onClick={() => setShowConfirmDelete(false)}>
                    Hayır, İptal Et
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
