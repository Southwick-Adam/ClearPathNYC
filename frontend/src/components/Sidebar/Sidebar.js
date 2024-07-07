import React, {useState} from 'react';
import './Sidebar.css';
import Loop from '../Loop/Loop.js';
import PointToPoint from '../PointToPoint/PointToPoint.js'

function Sidebar( {onFormSubmit} ) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoopOpen, setLoopOpen] = useState(false);
  const [isPtPOpen, setPtPOpen] = useState(false);

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
            <Loop onFormSubmit={onFormSubmit}/>
        </div>
        </div>

        <div className='ptp_wrapper'>
          <div className='toggle_title_row'>
            <button className='btn' onClick={togglePtP}>
              {isPtPOpen ? '▼' : '▶'}
            </button>
            <div className='container_title'>Point To Point</div>
          </div>
          <div className={`ptp_box ${isPtPOpen ? 'open' : 'closed'}`}>
            <PointToPoint onFormSubmit={onFormSubmit}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

