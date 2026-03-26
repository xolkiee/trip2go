import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  
  // States for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // States for Register
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // UI Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş yapılamadı.');
      }

      setSuccessMsg(data.message);
      // Token'ı localStorage'a kaydet
      if(data.token) {
        localStorage.setItem('trip2go_token', data.token);
        localStorage.setItem('trip2go_user', JSON.stringify(data.user));
      }

      // Başarılı giriş sonrası yönlendirme
      setTimeout(() => {
        if (data.user?.role === 'admin') {
          navigate('/admin/trips/new');
        } else {
          navigate('/trips');
        }
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt işlemi başarısız.');
      }

      setSuccessMsg(data.message + " Giriş yapabilirsiniz.");
      
      // Formu temizle ve Login tarafına geç
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPassword('');
      setTimeout(() => {
        setIsSignUpActive(false);
        setSuccessMsg('');
      }, 2000);

    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const togglePanel = () => {
    setIsSignUpActive(!isSignUpActive);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="auth-page-container">
      <div className={`auth-glass-card ${isSignUpActive ? 'right-panel-active' : ''}`}>
        
        {/* Register Panel */}
        <div className="auth-form-section sign-up">
          <form className="auth-form" onSubmit={handleRegister}>
            <h1 className="auth-title">Hesap Oluştur</h1>
            <p className="auth-subtitle">Trip2Go dünyasına adım atın</p>
            
            {(errorMsg && isSignUpActive) && <div className="error-msg">{errorMsg}</div>}
            {(successMsg && isSignUpActive) && <div className="success-msg">{successMsg}</div>}

            <div className="name-group">
              <div className="input-group">
                <input type="text" placeholder="Ad" className="auth-input" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Soyad" className="auth-input" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <input type="email" placeholder="E-Posta" className="auth-input" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Şifre" className="auth-input" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="auth-btn">Kayıt Ol</button>

            {/* Mobile switch only visible on small screens */}
            <div className="mobile-switch-text">
              Zaten hesabınız var mı?{' '}
              <button type="button" className="mobile-switch-btn" onClick={togglePanel}>Giriş Yap</button>
            </div>
          </form>
        </div>

        {/* Login Panel */}
        <div className="auth-form-section sign-in">
          <form className="auth-form" onSubmit={handleLogin}>
            <h1 className="auth-title">Tekrar Hoşgeldiniz</h1>
            <p className="auth-subtitle">Seyahatinize kaldığınız yerden devam edin</p>

            {(errorMsg && !isSignUpActive) && <div className="error-msg">{errorMsg}</div>}
            {(successMsg && !isSignUpActive) && <div className="success-msg">{successMsg}</div>}

            <div className="input-group">
              <input type="email" placeholder="E-Posta" className="auth-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Şifre" className="auth-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            
            <a href="#" className="auth-forgot" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
              Şifremi Unuttum?
            </a>
            
            <button type="submit" className="auth-btn">Giriş Yap</button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <a href="#" className="auth-forgot" onClick={(e) => { e.preventDefault(); navigate('/admin/login'); }} style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Yönetici misiniz?
              </a>
            </div>

            {/* Mobile switch only visible on small screens */}
            <div className="mobile-switch-text">
              Hesabınız yok mu?{' '}
              <button type="button" className="mobile-switch-btn" onClick={togglePanel}>Kayıt Ol</button>
            </div>
          </form>
        </div>

        {/* Animated Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            
            {/* Overlay Left Side (Visible when SignUp is active) */}
            <div className="auth-overlay-panel auth-overlay-left">
              <h1 className="auth-overlay-title">Zaten Bizden Biri Misin?</h1>
              <p className="auth-overlay-text">
                Kişisel bilgilerinizle giriş yapın ve bir sonraki seyahatinizi planlamaya devam edin.
              </p>
              <button className="auth-btn ghost" onClick={togglePanel}>
                Giriş Yap
              </button>
            </div>

            {/* Overlay Right Side (Visible when SignIn is active) */}
            <div className="auth-overlay-panel auth-overlay-right">
              <h1 className="auth-overlay-title">Merhaba, Gezgin!</h1>
              <p className="auth-overlay-text">
                Kişisel bilgilerinizi girin ve yeni yerler keşfetmek için bize katılın.
              </p>
              <button className="auth-btn ghost" onClick={togglePanel}>
                Kayıt Ol
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
