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

        <h1>Loop</h1>
      
      <div className="loop_toggle_container">
        <BusyToggleSwitch mode={mode} handleToggleChange={handleToggleChange} />
      </div>
      <div>
        <LocationFinder />
      </div>
      <div className="loop_distance_selector">
        <DistanceSelector />
      </div>
      <GoButton />
    </form>
  );
};

export default Loop;
