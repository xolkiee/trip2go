import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Reusing the Auth styling for consistency

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = request email, 2 = enter token + new pass
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccessMsg(data.message + (data.resetToken ? ` (Demo Token: ${data.resetToken})` : ''));
      setStep(2); // Move to token input step
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccessMsg(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-glass-card" style={{ maxWidth: '500px', minHeight: '400px' }}>
        
        <div className="auth-form-section sign-in" style={{ width: '100%', position:'relative', zIndex: 10 }}>
          {step === 1 ? (
            <form className="auth-form" onSubmit={handleRequestToken}>
              <h1 className="auth-title" style={{textAlign:'center'}}>Şifremi Unuttum</h1>
              <p className="auth-subtitle" style={{textAlign:'center'}}>Endişelenmeyin! E-posta adresinizi girin.</p>
              
              {errorMsg && <div className="error-msg">{errorMsg}</div>}
              {successMsg && <div className="success-msg">{successMsg}</div>}

              <div className="input-group">
                <input type="email" placeholder="Kayıtlı E-Posta Adresiniz" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="auth-btn" style={{width:'100%'}}>Sıfırlama Linki Gönder</button>
              
              <button type="button" className="auth-btn ghost" style={{width:'100%', marginTop:'15px', color:'#fff'}} onClick={() => navigate('/login')}>Giriş Yap'a Dön</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleResetPassword}>
              <h1 className="auth-title" style={{textAlign:'center'}}>Yeni Şifre</h1>
              <p className="auth-subtitle" style={{textAlign:'center'}}>Token bilginizi ve yeni şifrenizi girin.</p>
              
              {errorMsg && <div className="error-msg">{errorMsg}</div>}
              {successMsg && <div className="success-msg">{successMsg}</div>}

              <div className="input-group">
                <input type="text" placeholder="Sıfırlama Token'ı" className="auth-input" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
              </div>
              <div className="input-group">
                <input type="password" placeholder="Yeni Şifre" className="auth-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <button type="submit" className="auth-btn" style={{width:'100%'}}>Şifreyi Güncelle</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
