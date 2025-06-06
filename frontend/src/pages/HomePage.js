import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to MedRouter</h1>
      <nav>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/register">Register</Link></li>
          {/* Add links to other pages as auth flow is built */}
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
