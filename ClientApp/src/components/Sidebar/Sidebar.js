import React, {useState} from 'react';
import './Sidebar.css';
import Loop from '../Loop/Loop.js';
import PointToPoint from '../PointToPoint/PointToPoint.js'

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleSidebar() {
    setIsOpen(!isOpen);
  }
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="btn btn-primary toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '◀' : '▶'}
      </button>
      <div className="sidebar-content">
        <Loop />
        <PointToPoint />
      </div>
    </div>
  );
};

export default Sidebar;
