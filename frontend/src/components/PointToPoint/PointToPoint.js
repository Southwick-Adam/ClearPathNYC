import React, { useEffect } from 'react';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import './PointToPoint.css';
import Waypoint from '../Waypoint/Waypoint';
import useStore from '../../store/store';

function PointToPoint({ onFormSubmit, startGeocoderRef, endGeocoderRef, geocoderRefs, hideSidebar }) {  // Add hideSidebar prop
  const {
    startCord, endCord, isQuiet, includeWaypoints, visibleWaypoints,
    waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5,
    setStartCord, setEndCord, setIsQuiet, setIncludeWaypoints, setVisibleWaypoints,
    setWaypointCord1, setWaypointCord2, setWaypointCord3, setWaypointCord4, setWaypointCord5, resetWaypointCord
  } = useStore();

  const waypointStates = [
    { id: 1, coordinates: waypointCord1, setCoordinates: setWaypointCord1, geocoderRef: geocoderRefs[0] },
    { id: 2, coordinates: waypointCord2, setCoordinates: setWaypointCord2, geocoderRef: geocoderRefs[1] },
    { id: 3, coordinates: waypointCord3, setCoordinates: setWaypointCord3, geocoderRef: geocoderRefs[2] },
    { id: 4, coordinates: waypointCord4, setCoordinates: setWaypointCord4, geocoderRef: geocoderRefs[3] },
    { id: 5, coordinates: waypointCord5, setCoordinates: setWaypointCord5, geocoderRef: geocoderRefs[4] },
  ];

  useEffect(() => {
    if (includeWaypoints) {
      setVisibleWaypoints(1);
    } else {
      setVisibleWaypoints(0);
      waypointStates.forEach(({ setCoordinates, geocoderRef }) => {
        setCoordinates(null);
        if (geocoderRef && geocoderRef.current) {
          geocoderRef.current.setInput(''); // Clear the input field without triggering a query
          hideSuggestions(geocoderRef.current);
        }
      });
    }
  }, [includeWaypoints]);

  function handleToggleChange() {
    setIsQuiet(!isQuiet);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const coordinates = [
      startCord,
      ...waypointStates.slice(0, visibleWaypoints).map(w => w.coordinates),
      endCord,
    ].filter(coord => coord !== null);

    const formData = {
      isQuiet,
      coordinates,
    };

    console.log('Form data for pointToPoint sent to backend:', formData);
    onFormSubmit('pointToPoint', formData);
    hideSidebar();  // Hide the sidebar after form submission
  }

  function handleAddWaypoint() {
    if (visibleWaypoints < 5) {
      setVisibleWaypoints(visibleWaypoints + 1);
    }
  }

  function handleRemoveWaypoint(index) {
    resetWaypointCord(index + 1); // Adjusted to match 1-based indexing
    if (geocoderRefs[index].current) {
      geocoderRefs[index].current.setInput(''); // Clear the input field without triggering a query
      hideSuggestions(geocoderRefs[index].current);
    }
    for (let i = index; i < 4; i++) {
      waypointStates[i].setCoordinates(waypointStates[i + 1].coordinates);
      if (geocoderRefs[i + 1].current) {
        geocoderRefs[i + 1].current.setInput(''); // Clear the input field without triggering a query
        hideSuggestions(geocoderRefs[i + 1].current);
      }
    }
    setVisibleWaypoints(visibleWaypoints - 1);
  }

  function handleMoveWaypointUp(index) {
    if (index > 0) {
      const tempCoord = waypointStates[index - 1].coordinates;
      waypointStates[index - 1].setCoordinates(waypointStates[index].coordinates);
      waypointStates[index].setCoordinates(tempCoord);

      if (geocoderRefs[index].current && geocoderRefs[index - 1].current) {
        const currentInput = geocoderRefs[index].current._inputEl.value;
        const previousInput = geocoderRefs[index - 1].current._inputEl.value;

        geocoderRefs[index].current.setInput(previousInput);
        geocoderRefs[index - 1].current.setInput(currentInput);

        if (!currentInput.trim()) {
          hideSuggestions(geocoderRefs[index - 1].current);
        }
        if (!previousInput.trim()) {
          hideSuggestions(geocoderRefs[index].current);
        }
      }
    }
  }

  function handleMoveWaypointDown(index) {
    if (index < visibleWaypoints - 1) {
      const tempCoord = waypointStates[index + 1].coordinates;
      waypointStates[index + 1].setCoordinates(waypointStates[index].coordinates);
      waypointStates[index].setCoordinates(tempCoord);

      if (geocoderRefs[index].current && geocoderRefs[index + 1].current) {
        const currentInput = geocoderRefs[index].current._inputEl.value;
        const nextInput = geocoderRefs[index + 1]._inputEl.value;

        geocoderRefs[index].current.setInput(nextInput);
        geocoderRefs[index + 1].setInput(currentInput);

        if (!currentInput.trim()) {
          hideSuggestions(geocoderRefs[index + 1]);
        }
        if (!nextInput.trim()) {
          hideSuggestions(geocoderRefs[index]);
        }
      }
    }
  }

  function hideSuggestions(geocoder) {
    if (geocoder._container) {
      const suggestionBox = geocoder._container.querySelector('.suggestions');
      if (suggestionBox) {
        suggestionBox.style.display = 'none';
      }
    }
  }

  return (
    <form className="pointtopoint_container" onSubmit={handleSubmit}>
      <div className="ptp_row">
        <div className="ptp_label">Start</div>
        <LocationFinder setCoordinates={setStartCord} geocoderRef={startGeocoderRef} />
      </div>
      <div className='waypoints_container' style={{ display: includeWaypoints ? 'block' : 'none' }}>
        {waypointStates.slice(0, visibleWaypoints).map((waypoint, index) => (
          <Waypoint
            key={waypoint.id}
            id={waypoint.id}
            coordinates={waypoint.coordinates}
            onRemove={() => handleRemoveWaypoint(index)}
            onMoveUp={() => handleMoveWaypointUp(index)}
            onMoveDown={() => handleMoveWaypointDown(index)}
            setWaypointCoordinates={waypoint.setCoordinates}
            ref={waypoint.ref}
            geocoderRef={waypoint.geocoderRef}
            className={index < visibleWaypoints ? 'open' : ''}
          />
        ))}
        {visibleWaypoints < 5 && (
          <button type='button' className="btn btn-outline-success btn-lg d-block mx-auto addbtn" onClick={handleAddWaypoint}>+</button>
        )}
      </div>
      <div className="ptp_row">
        <div className="ptp_label">End</div>
        <LocationFinder setCoordinates={setEndCord} geocoderRef={endGeocoderRef} />
      </div>
      <div className="busy_go_row">
        <BusyToggleSwitch isQuiet={isQuiet} handleToggleChange={handleToggleChange} />
        <GoButton />
      </div>
      <div className='include_waypoints'>
        <label>
          <input
            type='checkbox'
            checked={includeWaypoints}
            onChange={() => setIncludeWaypoints(!includeWaypoints)}
          />
          Include Waypoints
        </label>
      </div>
    </form>
  );
}

export default PointToPoint;
