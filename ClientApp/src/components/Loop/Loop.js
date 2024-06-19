import React, { useState } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import './Loop.css';
import DistanceSelector from '../DistanceSelector/DistanceSelector';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import AutoLocationButton from '../AutoLocationButton/AutoLocationButton';


const Loop = () => {
  const [mode, setMode] = useState('quiet');

  const handleToggleChange = (val) => {
    setMode(val);
  };

  return (
    <form className="loop_container">

      <div className='container_title'>Loop</div>

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
