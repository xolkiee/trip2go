import { Routes, Route, Navigate } from 'react-router-dom';
import AdminTripCreate from './pages/AdminTripCreate';
import AdminTripUpdate from './pages/AdminTripUpdate';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/trips/new" replace />} />
        <Route path="/admin/trips/new" element={<AdminTripCreate />} />
        <Route path="/admin/trips/:id/edit" element={<AdminTripUpdate />} />
      </Routes>
    </div>
  );
}

export default App;
