import React, { useEffect, useState } from 'react';
import './Loop.css';
import DistanceSelector from '../DistanceSelector/DistanceSelector';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import useStore from '../../store/store';

function Loop({ onFormSubmit, geocoderRef }) {
  const {
    loopCord, setLoopCord, loopIsQuiet, toggleLoopIsQuiet, loopDistance, setLoopDistance, setIsSidebarOpen, clearWaypointData
  } = useStore();

  const [isGoButtonDisabled, setGoButtonDisabled] = useState(true);

  useEffect(() => {
    const isDisabled = loopCord === null || loopDistance === null || loopDistance === 0;
    setGoButtonDisabled(isDisabled);
  }, [loopCord, loopDistance]);

  function handleToggleChange() {
    toggleLoopIsQuiet();
  };

  function handleDistanceChange(dist) {
    setLoopDistance(dist);
  }

  function handleSubmit(event) {
    setIsSidebarOpen(false); // Close the sidebar upon form submission
    clearWaypointData(); // Clear waypoint data
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
        <div className="ptp_row">
          <div className="ptp_label">Start</div>
          <LocationFinder setCoordinates={setLoopCord} geocoderRef={geocoderRef} />
        </div>
      </div>
      <div className="loop_distance_selector">
        <div className="dist_label">Dist</div>
        <DistanceSelector distance={loopDistance} onDistanceChange={handleDistanceChange} />
      </div>
      <div className='busy_go_row'>
        <BusyToggleSwitch isQuiet={loopIsQuiet} handleToggleChange={handleToggleChange} />
        <GoButton disabled={isGoButtonDisabled} />
      </div>
    </form>
  );
};

export default Loop;
