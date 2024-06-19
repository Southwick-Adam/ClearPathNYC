//Parent component of MapComponent and LocationInput to manage the state for coordinates
// src/LocationFinder.js
import React, { useState, useRef} from 'react';
import LocationInput from '../LocationInput/LocationInput';
import mapboxgl from 'mapbox-gl';
import './LocationFinder.css';
import AutoLocationButton from '../AutoLocationButton/AutoLocationButton';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;


const LocationFinder = () => {
  const [coordinates, setCoordinates] = useState([40.776676, -73.971321]); // Central Manhattan
  const geocoderRef = useRef(null);

  return (
    <div className="location_finder_container" >
      <LocationInput setCoordinates={setCoordinates} geocoderRef={geocoderRef} />
      <AutoLocationButton setCoordinates={setCoordinates} geocoderRef={geocoderRef}/>
    </div>
  );
};

export default LocationFinder;
