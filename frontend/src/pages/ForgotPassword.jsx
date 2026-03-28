import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch(('https://trip2go-rho.vercel.app') + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Hata oluştu.');

      setSuccessMsg(data.message + (data.resetToken ? ` (Demo Token: ${data.resetToken})` : ''));
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await fetch(('https://trip2go-rho.vercel.app') + '/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Şifre güncellenemedi.');

      setSuccessMsg("Şifre başarıyla güncellendi! Giriş yapabilirsiniz.");
      setTimeout(() => navigate('/login'), 2000);
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
          <h2>{step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}</h2>
          <p>{step === 1 ? 'Endişelenmeyin! E-posta adresinizi girin.' : 'Doğrulama kodunu ve yeni şifrenizi girin.'}</p>
        </div>

        <div className="auth-body">
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="auth-form">
              <div className="form-group">
                <label>Kayıtlı E-Posta Adresiniz</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
              </button>
              
              <div className="admin-login-link">
                <Link to="/login">Giriş Yap Ekranına Dön</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label>Doğrulama Kodu (Token)</label>
                <input type="text" value={resetToken} onChange={e => setResetToken(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Yeni Şifreniz</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
