// Import necessary modules and hooks from React and React Router
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './InstagramStyle.css'; // Link to a CSS file for styling

// CreateAccountPage component definition
function CreateAccountPage() {
  const navigate = useNavigate(); // Hook for navigating between routes
  const [contact, setContact] = useState(''); // State for email or phone number
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState(''); // State for password
  const [fullname, setFullname] = useState(''); // State for full name
  const [registrationStatus, setRegistrationStatus] = useState(''); // State for status messages

  // Function to handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    console.log('Sending registration data:', { contact, username, password, fullname });
    setRegistrationStatus('Registering...'); // Display status message
    try {
      // Send registration data to the server via POST request
      const response = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact, username, password, fullname }), // Convert data to JSON
      });
      const data = await response.json(); // Parse JSON response from server
      console.log('Server response:', data);
      if (response.ok) {
        setRegistrationStatus('Account created successfully!');
        setTimeout(() => navigate('/'), 2000); // Redirect to login page after 2 seconds
      } else {
        setRegistrationStatus(data.error || 'Registration failed'); // Display error message
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus('An error occurred. Please try again.'); // Handle network or server errors
    }
  };

  return (
    <div className="auth-container"> {/* Container for the registration form */}
      <div className="logo">
        <h1>flickcraze</h1> {/* Logo or app name */}
      </div>
      <form className="auth-form" onSubmit={handleRegister}> {/* Form for registration */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Email or Phone number"
            value={contact}
            onChange={(e) => setContact(e.target.value)} // Update contact state
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)} // Update fullname state
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            required
          />
        </div>
        <button type="submit">Sign Up</button> {/* Submit button */}
        {registrationStatus && <p className="registration-status">{registrationStatus}</p>} {/* Display registration status */}
      </form>
      <div className="auth-switch">
        <p>Already have an account? <Link to="/">Log in</Link></p> {/* Link to login page */}
      </div>
    </div>
  );
}

export default CreateAccountPage;
