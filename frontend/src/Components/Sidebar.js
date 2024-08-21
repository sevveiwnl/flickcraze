import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">FlickCraze</div>
      <nav>
        <Link to="/feed">Home</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;