import React, { forwardRef, useEffect } from 'react';
import LocationFinder from '../LocationFinder/LocationFinder';
import './Waypoint.css';

const Waypoint = forwardRef(({ id, coordinates, onRemove, onMoveUp, onMoveDown, setWaypointCoordinates, geocoderRef }, ref) => {

  return (
    <div className="waypoint" ref={ref}>
      <div className="upDownWrapper">
        <button type="button" className="btn btn-outline-primary btn-sm upbtn" onClick={onMoveUp}>▲</button>
        <button type="button" className="btn btn-outline-primary btn-sm downbtn" onClick={onMoveDown}>▼</button>
      </div>
      <LocationFinder setCoordinates={setWaypointCoordinates} geocoderRef={geocoderRef} />
      <button type="button" className="btn btn-outline-danger btn-sm removebtn" onClick={onRemove}>X</button>
    </div>
  );
});

export default Waypoint;
