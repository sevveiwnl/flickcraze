import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InstagramStyle.css';

function LoginPage() {
  const navigate = useNavigate(); // Hook for navigation
  const [contact, setContact] = useState(''); // State for user input on contact (email/username)
  const [password, setPassword] = useState(''); // State for user input on password
  const [loginStatus, setLoginStatus] = useState(''); // State to display login status

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from submitting normally
    setLoginStatus('Logging in...');
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, password }), // Send contact and password as JSON
      });
      const data = await response.json();
      console.log('Server response:', data);
      if (response.ok) {
        setLoginStatus('Login successful!');
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in local storage
        setTimeout(() => navigate('/feed'), 1000); // Redirect to feed after login
      } else {
        setLoginStatus(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginStatus('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="logo">
        <h1>flickcraze</h1>
      </div>
      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Email or username"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log In</button>
        {loginStatus && <p className="login-status">{loginStatus}</p>}
      </form>
      <div className="auth-switch">
        <p>Don't have an account? <Link to="/create-account">Sign up</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;
