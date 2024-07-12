import React from 'react';
import PropTypes from 'prop-types';
import './PopupContent.css';

function PopupContent({ coordinates, name, setStartCord, setEndCord, setWaypointAndIncrease, updateStartInput, updateEndInput, updateWaypointInput, geocoderRefs }) {
  return (
    <div className="popup-content">
      <div className="popup_title">{name}</div>
      <div className="popup_button_wrapper">
        <button className="btn btn-primary btn-sm" onClick={async () => {
            setStartCord(coordinates);
            await updateStartInput(coordinates);
        }}>Set Start</button>
        <button className="btn btn-primary btn-sm" onClick={async () => {
            setEndCord(coordinates);
            await updateEndInput(coordinates);
        }}>Set End</button>
        <button className="btn btn-primary btn-sm" onClick={async () => {
            const index = setWaypointAndIncrease(coordinates);
            if (index !== -1 && index < 5) {
            await updateWaypointInput(index, coordinates);
            }
        }}>Set Waypoint</button>
      </div>
    </div>
  );
}

PopupContent.propTypes = {
  coordinates: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  setStartCord: PropTypes.func.isRequired,
  setEndCord: PropTypes.func.isRequired,
  setWaypointAndIncrease: PropTypes.func.isRequired,
  updateStartInput: PropTypes.func.isRequired,
  updateEndInput: PropTypes.func.isRequired,
  updateWaypointInput: PropTypes.func.isRequired,
  geocoderRefs: PropTypes.array.isRequired
};

export default PopupContent;
