import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('trip2go_token');
  const userStr = localStorage.getItem('trip2go_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('trip2go_token');
    localStorage.removeItem('trip2go_user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/trips" className="navbar-logo">
          Trip<span>2Go</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/trips" className="nav-link">Seferler</Link>
          
          {token ? (
            <>
              <Link to="/my-trips" className="nav-link">Seyahatlerim</Link>
              <Link to="/profile" className="nav-link">Profilim</Link>
              {isAdmin && (
                <Link to="/admin/trips/new" className="nav-link" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  ⚙️ Admin Paneli
                </Link>
              )}
              <button onClick={handleLogout} className="nav-btn logout-btn">
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Giriş Yap</Link>
              <Link to="/register" className="nav-btn">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
