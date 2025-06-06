import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';

function App() {
  // const { isAuthenticated, user, logout } = useAuthStore(); // Not directly used here, Navigation component handles this

  // Simple Nav component to use useNavigate for logout
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
      <Navigation /> {/* Use the Navigation component here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        {/* Example of a route accessible by any authenticated user:
        <Route element={<ProtectedRoute />}>
           <Route path="/some-general-protected-page" element={<SomeGeneralPage />} />
        </Route>
        */}

        <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
          <Route path="/dashboard/doctor" element={<DoctorDashboardPage />} />
        </Route>

        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
