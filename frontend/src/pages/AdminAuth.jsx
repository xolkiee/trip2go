import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const AdminAuth = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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

      if (data.user.role !== 'admin') {
        throw new Error('Bu panele sadece yöneticiler erişebilir.');
      }

      setSuccessMsg("Admin girişi başarılı. Yönlendiriliyorsunuz...");
      
      if(data.token) {
        localStorage.setItem('trip2go_token', data.token);
        localStorage.setItem('trip2go_user', JSON.stringify(data.user));
      }

      setTimeout(() => {
        navigate('/admin/trips/new');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-glass-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="auth-form-section" style={{ position: 'relative', width: '100%', maxWidth: '400px', opacity: 1, padding: '40px' }}>
          <form className="auth-form" onSubmit={handleLogin} style={{ width: '100%' }}>
            <h1 className="auth-title" style={{ color: '#a855f7', textAlign: 'center' }}>Yönetici Girişi</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center' }}>Trip2Go Yönetim Paneline Hoşgeldiniz</p>

            {errorMsg && <div className="error-msg">{errorMsg}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            <div className="input-group">
              <input type="email" placeholder="Admin E-Posta" className="auth-input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Şifre" className="auth-input" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            
            <button type="submit" className="auth-btn" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)' }}>Yönetici Girişi Yap</button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href="#" className="auth-forgot" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Normal Kullanıcı Girişine Dön
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
