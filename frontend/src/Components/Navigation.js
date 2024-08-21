import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="main-nav">
      <Link to="/feed">Home</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/upload">Upload</Link>
      <Link to="/search">Search</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navigation;