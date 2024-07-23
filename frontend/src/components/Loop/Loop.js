import React from 'react';
import './Loop.css';
import DistanceSelector from '../DistanceSelector/DistanceSelector';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import useStore from '../../store/store';

function Loop({ onFormSubmit, geocoderRef }) {
  const {
    loopCord, setLoopCord, loopIsQuiet, toggleLoopIsQuiet, loopDistance, setLoopDistance
  } = useStore();

  function handleToggleChange() {
    toggleLoopIsQuiet();
  };

  function handleDistanceChange(dist) {
    setLoopDistance(dist);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = {
      coordinates: loopCord,
      distance: loopDistance,
      mode: loopIsQuiet ? 'true' : 'false',
    };
    onFormSubmit('loop', formData);
  };

  return (
    <form className="loop_container" onSubmit={handleSubmit}>
      <div>
        <LocationFinder setCoordinates={setLoopCord} geocoderRef={geocoderRef} />
      </div>
      <div className="loop_distance_selector">
        <DistanceSelector distance={loopDistance} onDistanceChange={handleDistanceChange} />
      </div>
      <div className='busy_go_row'>
        <BusyToggleSwitch isQuiet={loopIsQuiet} handleToggleChange={handleToggleChange} /> 
        <GoButton />
      </div>
    </form>
  );
};

export default Loop;
