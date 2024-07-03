import React, { forwardRef } from 'react';
import LocationFinder from '../LocationFinder/LocationFinder';

const Waypoint = forwardRef(({ id, coordinates, onRemove, onMoveUp, onMoveDown, setWaypointCoordinates, geocoderRef }, ref) => {
  return (
    <div className="waypoint" ref={ref}>
      <div className="upDownWrapper">
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onMoveUp}>▲</button>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onMoveDown}>▼</button>
      </div>
      <LocationFinder setCoordinates={setWaypointCoordinates} geocoderRef={geocoderRef} />
      <button type="button" className="btn btn-outline-danger btn-sm" onClick={onRemove}>X</button>
    </div>
  );
});

export default Waypoint;
