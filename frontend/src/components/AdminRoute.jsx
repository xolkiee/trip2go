import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('trip2go_token');
  const userStr = localStorage.getItem('trip2go_user');
  
  // Token yoksa direkt admin girişine at
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Token var ama admin mi?
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // Backend'den role 'admin' gelmişse veya email admin mailiyse izin ver
      if (user.role === 'admin' || user.email === 'admin@trip2go.com') {
        return children;
      }
    } catch (e) {
      console.error("Yetki kontrolü hatası:", e);
    }
  }
  
  // Giriş yapmış ama admin yetkisi yoksa normal ana sayfaya fırlat
  return <Navigate to="/trips" replace />;
};

export default AdminRoute;
