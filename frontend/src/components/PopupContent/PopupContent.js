import React from 'react';
import PropTypes from 'prop-types';
import './PopupContent.css';
import useStore from '../../store/store';

function PopupContent({ coordinates, name, setLoopCord, setStartCord, setEndCord, setWaypointAndIncrease, updateLoopStartInput,updateStartInput, updateEndInput, updateWaypointInput, geocoderRefs, closePopup }) {
  const { enableWaypoints, isLoopOpen, isPtPOpen } = useStore((state) => ({
    enableWaypoints: state.enableWaypoints,
    isLoopOpen: state.isLoopOpen,
    isPtPOpen: state.isPtPOpen
  }));

  return (
    <div className="popup-content">
      <div className="popup_title">{name}</div>
      <div className="popup_button_wrapper">
        {isPtPOpen && !isLoopOpen ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={async () => {
                setStartCord(coordinates);
                await updateStartInput(coordinates);
                closePopup(); // Close popup
            }}>Set Start</button>
            <button className="btn btn-primary btn-sm" onClick={async () => {
                setEndCord(coordinates);
                await updateEndInput(coordinates);
                closePopup(); // Close popup
            }}>Set End</button>
            <button className="btn btn-primary btn-sm" onClick={async () => {
                enableWaypoints(); // Ensure includeWaypoints is true
                const index = setWaypointAndIncrease(coordinates);
                if (index !== -1 && index < 5) {
                  await updateWaypointInput(index, coordinates);
                }
                closePopup(); // Close popup
            }}>Set Waypoint</button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={async () => {
            setLoopCord(coordinates);
            await updateLoopStartInput(coordinates);
            closePopup(); // Close popup
          }}>Set Loop Start</button>
        )}
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
  geocoderRefs: PropTypes.array.isRequired,
  closePopup: PropTypes.func.isRequired // Add this line
};

export default PopupContent;
