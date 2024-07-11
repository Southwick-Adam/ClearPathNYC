import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import Loop from '../Loop/Loop.js';
import PointToPoint from '../PointToPoint/PointToPoint.js';
import NightModeButton from '../NightModeButton/NightModeButton.js';
import ExportButton from '../ExportButton/ExportButton.js';

function Sidebar({ onFormSubmit, startGeocoderRef, endGeocoderRef, geocoderRefs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoopOpen, setLoopOpen] = useState(false);
  const [isPtPOpen, setPtPOpen] = useState(false);

  useEffect(() => {
    const sidebarTimer = setTimeout(() => {
      setIsOpen(true);
    }, 3500); // Adjust the delay as needed

    const ptPTimer = setTimeout(() => {
      setPtPOpen(true);
    }, 4500); // Adjust the delay as needed to open PtP after sidebar opens

    return () => {
      clearTimeout(sidebarTimer);
      clearTimeout(ptPTimer);
    };
  }, []);

  function toggleSidebar() {
    setIsOpen(!isOpen);
  }
  function toggleLoop() {
    setLoopOpen(!isLoopOpen);
    setPtPOpen(false);
  }
  function togglePtP() {
    setPtPOpen(!isPtPOpen);
    setLoopOpen(false);
  }

  function hideSidebar() {
    setIsOpen(false);
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="btn btn-primary toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '◀' : '▶'}
      </button>
      <div className="sidebar-content">
        <div className='loop_wrapper'>
          {/* The id here is used to hide the loop container for MVP*/}
          <div className='toggle_title_row' id='loop_toggle_title_row'> 
            <button className='btn' onClick={toggleLoop}>
              {isLoopOpen ? '▼' : '▶'}
            </button>
            <div className='container_title'>Loop</div>
          </div>
          <div className={`loop_box ${isLoopOpen ? 'open' : 'closed'}`}>
            <Loop onFormSubmit={onFormSubmit} />
          </div>
        </div>
        <div className='ptp_wrapper'>
          <div className='toggle_title_row'>
            <button className='btn' onClick={togglePtP}>
              {isPtPOpen ? '▼' : '▶'}
            </button>
            <div className='container_title'>Point to Point</div>
          </div>
          <div className={`ptp_box ${isPtPOpen ? 'open' : 'closed'}`}>
            <PointToPoint
              onFormSubmit={onFormSubmit}
              startGeocoderRef={startGeocoderRef}
              endGeocoderRef={endGeocoderRef}
              geocoderRefs={geocoderRefs}
              hideSidebar={hideSidebar}  // Pass hideSidebar function to PointToPoint
            />
          </div>
        </div>
        <div className='night-export-container'>
          <NightModeButton />
          <ExportButton />
        </div>
        <div className="sidebar_logo">
          <img src={require('../../assets/images/ClearPath_logo.png')} alt="ClearPath NYC logo monochrome" />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
