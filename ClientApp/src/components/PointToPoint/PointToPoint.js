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
            <h1>Point To Point</h1>
            <div className='ptp_row'>
                <h3>Start</h3>
                <LocationFinder />
            </div>
            <div className='ptp_row'>
                <h3>End</h3>
                <LocationFinder />
            </div>
            {/* POI  */}
            {/* <div>
                <h3>Add POIs to Routes</h3>
                <LocationFinder />

            </div> */}
            <div>
                <BusyToggleSwitch mode={mode} handleToggleChange={handleToggleChange}/>
            </div>
            <div>
                <GoButton />
            </div>
            
        </div>
        
    )
};

export default PointToPoint;