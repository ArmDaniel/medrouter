import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const { loading, error, isAuthenticated } = useAuthStore((state) => ({
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated
  }));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Navigation is now handled by useEffect
    } catch (err) {
      // Error is handled by the store and displayed below
      console.error("Login failed:", err);
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      const user = useAuthStore.getState().user;
      if (user && user.role === 'Doctor') {
        navigate('/dashboard/doctor');
      } else if (user) {
        navigate('/chat');
      } else {
        navigate('/'); // Fallback, should not happen if isAuthenticated
      }
    }
  }, [isAuthenticated, navigate]);


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
