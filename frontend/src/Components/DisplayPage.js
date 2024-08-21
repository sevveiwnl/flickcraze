// Import necessary modules and hooks from React and React Router
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// DisplayPage component definition
function DisplayPage() {
  const navigate = useNavigate(); // Hook for navigating between routes
  const [user, setUser] = useState(null); // State to store the logged-in user's data

  // useEffect hook to check if the user is logged in
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user'); // Retrieve user data from localStorage
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser)); // Parse and set the user data
    } else {
      navigate('/'); // Redirect to login page if not logged in
    }
  }, [navigate]);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user data from localStorage
    navigate('/'); // Redirect to login page
  };

  if (!user) return <div>Loading...</div>; // Show loading if user data is not yet loaded

  return (
    <div>
      <h1>Welcome, {user.fullname}!</h1> {/* Display user's full name */}
      <p>This is your display page.</p> {/* Placeholder content */}
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
    </div>
  );
}

export default DisplayPage;
