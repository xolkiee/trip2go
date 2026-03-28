import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Tab steyti: 'login' veya 'register' - URL'den okunuyor
  const [activeTab, setActiveTab] = useState(location.pathname === '/register' ? 'register' : 'login');

  // URL dışarıdan değişirse (örneğin Kayıt Ol butonuna basılırsa) sekme değişsin
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  // Tab değiştirildiğinde URL de güncellensin
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'register') {
      navigate('/register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // UI Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
    if (!emailRegex.test(email)) {
      setErrorMsg('Lütfen sadece .com uzantılı geçerli bir e-posta adresi giriniz (örnek: isim@domain.com).');
      return;
    }

    setLoading(true);

    const isLogin = activeTab === 'login';
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    // Şimdilik Backend henüz bağlanmadığı için dummy davranış gösterelim 
    // veya Ömer'in yazdığı /api/auth rotalarına istek atalım.
    try {
      const response = await fetch(`${'https://trip2go-rho.vercel.app'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isLogin
            ? { email, password }
            : { firstName, lastName, email, password }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isLogin ? 'Giriş yapılamadı.' : 'Kayıt işlemi başarısız.'));
      }

      setSuccessMsg(data.message || (isLogin ? "Giriş Başarılı!" : "Kayıt Başarılı! Giriş yapabilirsiniz."));

      if (isLogin) {
        if (data.token) {
          localStorage.setItem('trip2go_token', data.token);
          localStorage.setItem('trip2go_user', JSON.stringify(data.user));
        } else {
          // Dummy token for testing
          localStorage.setItem('trip2go_token', 'dummy_token_123');
        }

        setTimeout(() => {
          if (data.user?.role === 'admin' || email === 'admin@trip2go.com') {
            navigate('/admin/trips/new');
          } else {
            navigate('/trips');
          }
        }, 1500);
      } else {
        // Switch to login tab after register
        setTimeout(() => {
          handleTabChange('login');
          setSuccessMsg('');
          setPassword('');
        }, 2000);
      }
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
          <h2>Trip<span>2Go</span> ile Seyahate Başla</h2>
          <p>Hızlı ve güvenli bilet almanın adresi</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabChange('login')}
            type="button"
          >
            Üye Girişi
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
            type="button"
          >
            Üye Ol
          </button>
        </div>

        <div className="auth-body">
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'register' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Adınız</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Soyadınız</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>E-Posta Adresi</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@mail.com" required />
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {activeTab === 'login' && (
              <div className="auth-forgot-link">
                <Link to="/forgot-password">Şifremi Unuttum</Link>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Lütfen Bekleyin...' : (activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
            </button>
          </form>

          {activeTab === 'login' && (
            <div className="admin-login-link">
              <Link to="/admin/login">Yönetici Paneli İçin Tıklayın</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
