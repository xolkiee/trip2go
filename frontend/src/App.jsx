import { Routes, Route, Navigate } from 'react-router-dom';
import AdminTripCreate from './pages/AdminTripCreate';
import AdminTripUpdate from './pages/AdminTripUpdate';
import Auth from './pages/Auth';
import AdminAuth from './pages/AdminAuth';
import ForgotPassword from './pages/ForgotPassword';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:id" element={<TripDetails />} />
        <Route path="/admin/trips/new" element={<AdminTripCreate />} />
        <Route path="/admin/trips/:id/edit" element={<AdminTripUpdate />} />
      </Routes>
    </div>
  );
}

export default App;
