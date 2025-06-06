import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Patient'); // Default role
  const [specialty, setSpecialty] = useState('');
  const register = useAuthStore((state) => state.register);
    const { loading, error, isAuthenticated } = useAuthStore((state) => ({
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated
  }));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { name, email, password, role };
    if (role === 'Doctor') {
      userData.specialty = specialty;
    }
    try {
      await register(userData);
      // Navigation is now handled by useEffect
    } catch (err) {
      // Error is handled by the store
      console.error("Registration failed:", err);
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
        navigate('/');
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
          </select>
        </div>
        {role === 'Doctor' && (
          <div>
            <label htmlFor="specialty">Specialty:</label>
            <input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
