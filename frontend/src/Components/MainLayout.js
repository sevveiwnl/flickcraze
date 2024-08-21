import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut } from 'react-feather';
import FeedContent from './FeedContent';
import ProfileContent from './ProfileContent';
import UploadContent from './UploadContent';
import PhotoDetailContent from './PhotoDetailContent';
import SearchContent from './SearchContent';
import './MainLayout.css';

function MainLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <Link to="/feed" className="logo">FlickCraze</Link>
        <nav className="nav-links">
          <Link to="/feed" className="nav-link"><Home size={24} /> Home</Link>
          <Link to="/search" className="nav-link"><Search size={24} /> Search</Link>
          <Link to="/upload" className="nav-link"><PlusSquare size={24} /> Upload</Link>
          <Link to="/profile" className="nav-link"><User size={24} /> Profile</Link>
          <button onClick={handleLogout} className="nav-link logout-button"><LogOut size={24} /> Logout</button>
        </nav>
      </aside>
      <div className="main-content">
        <header className="top-navigation">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search posts..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </form>
        </header>
        <div className="content-area">
          <Routes>
            <Route path="/feed" element={<FeedContent />} />
            <Route path="/profile/:id?" element={<ProfileContent />} />
            <Route path="/upload" element={<UploadContent />} />
            <Route path="/detail/:id" element={<PhotoDetailContent />} />
            <Route path="/search" element={<SearchContent />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;