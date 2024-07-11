import React, { useState, useEffect } from 'react';
import './Sidebar.css';

function Sidebar({ onFormSubmit, startGeocoderRef, endGeocoderRef, geocoderRefs }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const legendTimer = setTimeout(() => {
      setIsOpen(true);
    }, 3500); // Adjust the delay as needed

    return () => {
      clearTimeout(legendTimer);
    };
  }, []);

  function toggleLegend() {
    setIsOpen(!isOpen);
  }

  function hideLegend() {
    setIsOpen(false);
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="btn btn-primary toggle-btn" onClick={toggleLegend}>
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
              hideLegend={hideLegend}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
