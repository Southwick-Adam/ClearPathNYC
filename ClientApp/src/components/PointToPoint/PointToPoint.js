import React, { useState } from 'react';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import './PointToPoint.css';


function PointToPoint(){
    const [mode, setMode] = useState('quiet');

  const handleToggleChange = (newMode) => {
    setMode(newMode);
  };
    return(
        <div className='pointtopoint_container'>
            <div className='ptp_row'>
            <div className='ptp_label'>Start</div>
                <LocationFinder />
            </div>
            <div className='ptp_row'>
                <div className='ptp_label'>End</div>
                <LocationFinder />
            </div>
            <div className='busy_go_row'>
                <BusyToggleSwitch mode={mode} handleToggleChange={handleToggleChange} /> 
                <GoButton />
            </div>
        </div>
    )
};

export default PointToPoint;