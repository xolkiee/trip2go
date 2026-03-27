import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminTripCreate from './pages/AdminTripCreate';
import AdminTripUpdate from './pages/AdminTripUpdate';
import Auth from './pages/Auth';
import AdminAuth from './pages/AdminAuth';
import ForgotPassword from './pages/ForgotPassword';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Checkout from './pages/Checkout';
import MyTrips from './pages/MyTrips';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/trips/new" element={<AdminRoute><AdminTripCreate /></AdminRoute>} />
          <Route path="/admin/trips/:id/edit" element={<AdminRoute><AdminTripUpdate /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
