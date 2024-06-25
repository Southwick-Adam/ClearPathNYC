import React, { useState } from 'react';
import './Loop.css';
import DistanceSelector from '../DistanceSelector/DistanceSelector';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';

function Loop({onFormSubmit}) {
  const [coordinates, setCoordinates] = useState(null);
  const [distance, setDistance] = useState('');
  const [mode, setMode] = useState('quiet');

  function handleToggleChange(val){
    setMode(val);
  };

  function handleDistanceChange(dist){
    setDistance(dist);
  }

  function handleSubmit(event){
    event.preventDefault(); // prevent default form submission processses for smoother user interaction
    const formData = {
      coordinates,
      distance,
      mode,
    };
    onFormSubmit('loop',formData);
  };

  return (
    <form className="loop_container" onSubmit={handleSubmit}>
      <div>
        <LocationFinder setCoordinates={setCoordinates}/>
      </div>
      <div className="loop_distance_selector">
        <DistanceSelector distance={distance} onDistanceChange={handleDistanceChange}/>
      </div>
      <div className='busy_go_row'>
      <BusyToggleSwitch mode={mode} handleToggleChange={handleToggleChange} /> 
      <GoButton />
      </div>
      
    </form>
  );
};

export default Loop;
