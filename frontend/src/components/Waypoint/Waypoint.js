import React, { forwardRef } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LocationFinder from '../LocationFinder/LocationFinder';
import './Waypoint.css';

const Waypoint = forwardRef(({ id, coordinates, onRemove, onMoveUp, onMoveDown, setWaypointCoordinates, geocoderRef }, ref) => {
  return (
    <div className="waypoint" ref={ref}>
      <div className="upDownWrapper">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-up-${id}`}>Move Waypoint Up</Tooltip>}
        >
          <Button variant="outline-primary" size="sm" className="upbtn" onClick={onMoveUp}>
            ▲
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-down-${id}`}>Move Waypoint Down</Tooltip>}
        >
          <Button variant="outline-primary" size="sm" className="downbtn" onClick={onMoveDown}>
            ▼
          </Button>
        </OverlayTrigger>
      </div>
      <LocationFinder setCoordinates={setWaypointCoordinates} geocoderRef={geocoderRef} />
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-remove-${id}`}>Remove Waypoint</Tooltip>}
      >
        <Button variant="outline-danger" size="sm" className="removebtn" onClick={onRemove}>
          ✖
        </Button>
      </OverlayTrigger>
    </div>
  );
});

export default Waypoint;
