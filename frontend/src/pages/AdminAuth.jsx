import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const AdminAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register States
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('bus');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    if (!emailRegex.test(loginEmail)) {
      setErrorMsg('Lütfen geçerli ve .com uzantılı bir e-posta adresi giriniz (örnek: admin@domain.com).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(('https://trip2go-rho.vercel.app') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş yapılamadı.');
      }

      if (data.user?.role !== 'admin' && loginEmail !== 'admin@trip2go.com') {
        throw new Error('Bu panele sadece yöneticiler erişebilir.');
      }

      setSuccessMsg("Admin girişi başarılı. Yönlendiriliyorsunuz...");
      
      if(data.token) {
        localStorage.setItem('trip2go_token', data.token);
        localStorage.setItem('trip2go_user', JSON.stringify(data.user));
      } else {
        localStorage.setItem('trip2go_token', 'admin_dummy_token_123');
      }

      setTimeout(() => {
        navigate('/admin/trips/new');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    if (!emailRegex.test(registerEmail)) {
      setErrorMsg('Lütfen geçerli ve .com uzantılı bir e-posta adresi giriniz (örnek: admin@domain.com).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(('https://trip2go-rho.vercel.app') + '/api/auth/admin-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: companyName, 
          lastName: 'Yetkilisi', 
          email: registerEmail, 
          password: registerPassword, 
          secretKey,
          companyType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt işlemi başarısız.');
      }

      setSuccessMsg(data.message || "Admin kaydı başarılı! Giriş yapabilirsiniz.");
      setTimeout(() => {
        setIsLogin(true);
      }, 2000);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Trip2Go Yönetim Paneli</h2>
          <div className="auth-tabs" style={{display: 'flex', marginTop: '15px'}}>
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
              style={{flex: 1, padding: '10px', border: 'none', borderBottom: isLogin ? '2px solid var(--primary-orange)' : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: 'bold'}}
            >
              Giriş Yap
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
              style={{flex: 1, padding: '10px', border: 'none', borderBottom: !isLogin ? '2px solid var(--primary-orange)' : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: 'bold'}}
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        <div className="auth-body">
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {isLogin ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>Admin E-Posta</label>
                <input type="email" placeholder="admin@trip2go.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>Şifre</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
              
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Lütfen Bekleyin...' : 'Yönetici Girişi Yap'}
              </button>

              <div className="admin-login-link">
                <Link to="/login">Normal Kullanıcı Girişine Dön</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Firma Adı</label>
                <input type="text" placeholder="Örn: Pamukkale Turizm" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Firmanızın Hizmet Türü</label>
                <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} required style={{padding: '12px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', fontSize: '1rem'}}>
                  <option value="bus">Otobüs</option>
                  <option value="flight">Uçak</option>
                </select>
              </div>

              <div className="form-group">
                <label>Kurumsal E-Posta</label>
                <input type="email" placeholder="admin@trip2go.com" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Şifre</label>
                <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Yetkilendirme Anahtarı</label>
                <input type="password" placeholder="İpucu: trip2go-admin" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading} style={{backgroundColor: 'var(--primary-blue)'}}>
                {loading ? 'Kaydediliyor...' : 'Yönetici Olarak Kaydol'}
              </button>

              <div className="admin-login-link">
                <Link to="/login">Normal Kullanıcı Girişine Dön</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
