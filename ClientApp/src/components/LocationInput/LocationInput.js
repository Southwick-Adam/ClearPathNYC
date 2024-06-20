import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '../../../node_modules/@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import './LocationInput.css';
import { MAPBOX_TOKEN} from '../.././config';


mapboxgl.accessToken = MAPBOX_TOKEN

const LocationInput = ({ setCoordinates, geocoderRef }) => {
  const geocoderContainer = React.useRef(null);

  useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      // Including address and POI for finer search result
      types: 'country,region,place,postcode,locality,neighborhood,address,poi',
      // Adding fuzzyMatch to handle misspelled/ partial names
      fuzzyMatch: true,
      proximity: {
        // Setting proximity to Manhattan to increase relevance of search result
        longitude: -73.9712,
        latitude: 40.7831,
      },
        // Setting bounding-box to restrict search-result to Manhattan
      bbox:[-74.0479, 40.6794, -73.9067, 40.8820] 
      });

    geocoder.on('result', (e) => {
      const { center } = e.result.geometry;
      setCoordinates(center);
    });

    const container = geocoderContainer.current;
    if (container) {
      container.innerHTML = "";
      container.appendChild(geocoder.onAdd());
    }
    // Save reference to geocoder
    geocoderRef.current = geocoder;
    }, 
    [setCoordinates, geocoderRef]);

  return (
    <div className="location_input_container">
      <div ref={geocoderContainer}></div>
    </div>
  );
};

export default LocationInput;
