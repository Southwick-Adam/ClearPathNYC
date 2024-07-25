import React, { useEffect } from 'react';
import useStore from '../../store/store';
import './Sidebar.css';
import Loop from '../Loop/Loop.js';
import PointToPoint from '../PointToPoint/PointToPoint.js';
import NightModeButton from '../NightModeButton/NightModeButton.js';
import ExportButton from '../ExportButton/ExportButton.js';
import CBButton from '../CBButton/CBButton.js';

function Sidebar({ onFormSubmit, startGeocoderRef, endGeocoderRef, geocoderRefs, loopGeocoderRef }) {
  const { 
    isNightMode, 
    isColorBlindMode, 
    isLoopOpen, 
    isPtPOpen, 
    setIsLoopOpen, 
    setIsPtPOpen,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useStore();

  useEffect(() => {
    if (window.innerWidth > 480) {
      const sidebarTimer = setTimeout(() => {
        setIsSidebarOpen(true);
      }, 3500); // Adjust the delay as needed

      const ptPTimer = setTimeout(() => {
        setIsPtPOpen(true);
      }, 4500); // Adjust the delay as needed to open PtP after sidebar opens

      return () => {
        clearTimeout(sidebarTimer);
        clearTimeout(ptPTimer);
      };
    }
  }, []);

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen);
  }

  function toggleLoop() {
    setIsLoopOpen(!isLoopOpen);
    setIsPtPOpen(isLoopOpen); // Ensure PtP state is opposite to Loop
  }

  function togglePtP() {
    setIsPtPOpen(!isPtPOpen);
    setIsLoopOpen(isPtPOpen); // Ensure Loop state is opposite to PtP
  }

  function hideSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isNightMode ? 'night' : 'day'}`}>
      <button
        className={`btn btn-primary toggle-btn ${isNightMode ? 'night' : 'day'} ${isColorBlindMode ? 'color-blind' : ''}`}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? '◀' : '▶'}
      </button>
      <div className="sidebar-content-wrapper">
        <div className="sidebar-content">
          <div className='loop_wrapper'>
            <div className='toggle_title_row' id='loop_toggle_title_row' onClick={toggleLoop}> 
              <button className={`wrapper-btn ${isNightMode ? 'night' : 'day'}`} >
                {isLoopOpen ? '▼' : '▶'}
              </button>
              <div className={`container_title ${isNightMode ? 'night' : 'day'}`}>Loop</div>
            </div>
            <div className={`loop_box ${isLoopOpen ? 'open' : 'closed'}`}>
              <Loop onFormSubmit={onFormSubmit} geocoderRef={loopGeocoderRef} />
            </div>
          </div>
          <div className='ptp_wrapper'>
            <div className='toggle_title_row'onClick={togglePtP}>
              <button className={`wrapper-btn ${isNightMode ? 'night' : 'day'}`} >
                {isPtPOpen ? '▼' : '▶'}
              </button>
              <div className={`container_title ${isNightMode ? 'night' : 'day'}`}>PointToPoint</div>
            </div>
            <div className={`ptp_box ${isPtPOpen ? 'open' : 'closed'}`}>
              <PointToPoint
                onFormSubmit={onFormSubmit}
                startGeocoderRef={startGeocoderRef}
                endGeocoderRef={endGeocoderRef}
                geocoderRefs={geocoderRefs}
                hideSidebar={hideSidebar} // Pass hideSidebar function to PointToPoint
              />
            </div>
          </div>
        </div>
        <div className="sidebar_footer">
          <div className='night-export-container'>
            <CBButton />
            <NightModeButton />
            <ExportButton />
          </div>
          <div className="sidebar_logo">
            <img src={require('../../assets/images/ClearPath_logo.png')} alt="ClearPath NYC logo monochrome" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
