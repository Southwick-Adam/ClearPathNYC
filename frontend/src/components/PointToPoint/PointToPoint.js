import React, { useState, useEffect, useRef } from 'react';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import './PointToPoint.css';
import Waypoint from '../Waypoint/Waypoint';

function PointToPoint({ onFormSubmit }) {
  const [startCord, setStartCord] = useState(null);
  const [endCord, setEndCord] = useState(null);
  const [isQuiet, setIsQuiet] = useState(true);
  const [includeWaypoints, setIncludeWaypoints] = useState(false);
  const [visibleWaypoints, setVisibleWaypoints] = useState(0);

  const waypointRef1 = useRef(null);
  const waypointRef2 = useRef(null);
  const waypointRef3 = useRef(null);
  const waypointRef4 = useRef(null);
  const waypointRef5 = useRef(null);

  const geocoderRef1 = useRef(null);
  const geocoderRef2 = useRef(null);
  const geocoderRef3 = useRef(null);
  const geocoderRef4 = useRef(null);
  const geocoderRef5 = useRef(null);

  const [waypointCord1, setWaypointCord1] = useState(null);
  const [waypointCord2, setWaypointCord2] = useState(null);
  const [waypointCord3, setWaypointCord3] = useState(null);
  const [waypointCord4, setWaypointCord4] = useState(null);
  const [waypointCord5, setWaypointCord5] = useState(null);

  const waypointStates = [
    { id: 1, coordinates: waypointCord1, setCoordinates: setWaypointCord1, ref: waypointRef1, geocoderRef: geocoderRef1 },
    { id: 2, coordinates: waypointCord2, setCoordinates: setWaypointCord2, ref: waypointRef2, geocoderRef: geocoderRef2 },
    { id: 3, coordinates: waypointCord3, setCoordinates: setWaypointCord3, ref: waypointRef3, geocoderRef: geocoderRef3 },
    { id: 4, coordinates: waypointCord4, setCoordinates: setWaypointCord4, ref: waypointRef4, geocoderRef: geocoderRef4 },
    { id: 5, coordinates: waypointCord5, setCoordinates: setWaypointCord5, ref: waypointRef5, geocoderRef: geocoderRef5 },
  ];

  useEffect(() => {
    if (includeWaypoints) {
      setVisibleWaypoints(1);
    } else {
      setVisibleWaypoints(0);
      waypointStates.forEach(({ setCoordinates, geocoderRef }) => {
        setCoordinates(null);
        if (geocoderRef.current) {
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
  }

  function handleAddWaypoint() {
    if (visibleWaypoints < 5) {
      setVisibleWaypoints(visibleWaypoints + 1);
    }
  }

  function handleRemoveWaypoint(index) {
    waypointStates[index].setCoordinates(null);
    if (waypointStates[index].geocoderRef.current) {
      waypointStates[index].geocoderRef.current.setInput(''); // Clear the input field without triggering a query
      hideSuggestions(waypointStates[index].geocoderRef.current);
    }
    for (let i = index; i < 4; i++) {
      waypointStates[i].setCoordinates(waypointStates[i + 1].coordinates);
      if (waypointStates[i + 1].geocoderRef.current) {
        waypointStates[i + 1].geocoderRef.current.setInput(''); // Clear the input field without triggering a query
        hideSuggestions(waypointStates[i + 1].geocoderRef.current);
      }
    }
    setVisibleWaypoints(visibleWaypoints - 1);
  }

  function handleMoveWaypointUp(index) {
    if (index > 0) {
      const tempCoord = waypointStates[index - 1].coordinates;
      waypointStates[index - 1].setCoordinates(waypointStates[index].coordinates);
      waypointStates[index].setCoordinates(tempCoord);

      if (waypointStates[index].geocoderRef.current && waypointStates[index - 1].geocoderRef.current) {
        const currentInput = waypointStates[index].geocoderRef.current._inputEl.value;
        const previousInput = waypointStates[index - 1].geocoderRef.current._inputEl.value;

        waypointStates[index].geocoderRef.current.setInput(previousInput);
        waypointStates[index - 1].geocoderRef.current.setInput(currentInput);

        if (!currentInput.trim()) {
          hideSuggestions(waypointStates[index - 1].geocoderRef.current);
        }
        if (!previousInput.trim()) {
          hideSuggestions(waypointStates[index].geocoderRef.current);
        }
      }
    }
  }

  function handleMoveWaypointDown(index) {
    if (index < visibleWaypoints - 1) {
      const tempCoord = waypointStates[index + 1].coordinates;
      waypointStates[index + 1].setCoordinates(waypointStates[index].coordinates);
      waypointStates[index].setCoordinates(tempCoord);

      if (waypointStates[index].geocoderRef.current && waypointStates[index + 1].geocoderRef.current) {
        const currentInput = waypointStates[index].geocoderRef.current._inputEl.value;
        const nextInput = waypointStates[index + 1].geocoderRef.current._inputEl.value;

        waypointStates[index].geocoderRef.current.setInput(nextInput);
        waypointStates[index + 1].geocoderRef.current.setInput(currentInput);

        if (!currentInput.trim()) {
          hideSuggestions(waypointStates[index + 1].geocoderRef.current);
        }
        if (!nextInput.trim()) {
          hideSuggestions(waypointStates[index].geocoderRef.current);
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
        <LocationFinder setCoordinates={setStartCord} geocoderRef={geocoderRef1} />
      </div>
      <div className="ptp_row">
        <div className="ptp_label">End</div>
        <LocationFinder setCoordinates={setEndCord} geocoderRef={geocoderRef2} />
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
          />
        ))}
        {visibleWaypoints < 5 && (
          <button type='button'  className="btn btn-outline-success btn-lg d-block mx-auto addbtn" onClick={handleAddWaypoint}>+</button>
        )}
      </div>
    </form>
  );
}

export default PointToPoint;
