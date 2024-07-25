import React, { forwardRef } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LocationFinder from '../LocationFinder/LocationFinder';
import useStore from '../../store/store';
import './Waypoint.css';

const Waypoint = forwardRef(({ id, coordinates, onRemove, onMoveUp, onMoveDown, setWaypointCoordinates, geocoderRef }, ref) => {
  const { isNightMode } = useStore();

  return (
    <div className={`waypoint ${isNightMode ? 'night-mode' : ''}`} ref={ref}>
      <div className="upDownWrapper">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-up-${id}`}>Move Waypoint Up</Tooltip>}
        >
          <Button variant="outline-primary" size="sm" className={`upbtn ${isNightMode ? 'night-mode' : ''}`} onClick={onMoveUp}>
            ▲
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-down-${id}`}>Move Waypoint Down</Tooltip>}
        >
          <Button variant="outline-primary" size="sm" className={`downbtn ${isNightMode ? 'night-mode' : ''}`} onClick={onMoveDown}>
            ▼
          </Button>
        </OverlayTrigger>
      </div>
      <LocationFinder setCoordinates={setWaypointCoordinates} geocoderRef={geocoderRef} />
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-remove-${id}`}>Remove Waypoint</Tooltip>}
      >
        <Button size="sm" className={`removebtn ${isNightMode ? 'night-mode' : ''}`} onClick={onRemove}>
          ✖
        </Button>
      </OverlayTrigger>
    </div>
  );
});

export default Waypoint;
