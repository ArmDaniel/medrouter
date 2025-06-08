import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import PatientFileUploadPage from './pages/PatientFileUploadPage'; // New Import
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';

function App() {
  const Navigation = () => {
    const navigate = useNavigate();
    const { isAuthenticated: isLoggedIn, user: currentUser, logout: doLogout } = useAuthStore();

    const handleLogoutClick = () => {
      doLogout();
      navigate('/login');
    };

    return (
      <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', gap: '15px' }}>
          <li><Link to="/">Home</Link></li>
          {!isLoggedIn ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              {currentUser?.role === 'Patient' && <li><Link to="/chat">Chat</Link></li>}
              {currentUser?.role === 'Patient' && <li><Link to="/upload-files">Upload Files</Link></li>} {/* New Link */}
              {currentUser?.role === 'Doctor' && <li><Link to="/dashboard/doctor">Doctor Dashboard</Link></li>}
              <li><button onClick={handleLogoutClick}>Logout ({currentUser?.name})</button></li>
            </>
          )}
        </ul>
      </nav>
    );
  };

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload-files" element={<PatientFileUploadPage />} /> {/* New Route */}
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
          <Route path="/dashboard/doctor" element={<DoctorDashboardPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
