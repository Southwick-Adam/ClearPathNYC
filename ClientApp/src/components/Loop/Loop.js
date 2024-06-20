import React, { useState } from 'react';
import './Loop.css';
import DistanceSelector from '../DistanceSelector/DistanceSelector';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';

const Loop = () => {
  const [mode, setMode] = useState('quiet');

  const handleToggleChange = (val) => {
    setMode(val);
  };

  return (
    <form className="loop_container">
      <div>
        <LocationFinder />
      </div>
      <div className="loop_distance_selector">
        <DistanceSelector />
      </div>
      <div className='busy_go_row'>
      <BusyToggleSwitch mode={mode} handleToggleChange={handleToggleChange} /> 
      <GoButton />
      </div>
      
    </form>
  );
};

export default Loop;
