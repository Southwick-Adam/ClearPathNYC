import React, { useEffect, useRef, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '../../../node_modules/@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './LocationInput.css';
import { MAPBOX_TOKEN } from '../../config';

mapboxgl.accessToken = MAPBOX_TOKEN;

const LocationInput = forwardRef(({ setCoordinates, setPlaceName, geocoderRef }, ref) => {
  const geocoderContainer = useRef(null);

  useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      types: 'country,region,place,postcode,locality,neighborhood,address,poi',
      fuzzyMatch: true,
      proximity: {
        longitude: -73.9712,
        latitude: 40.7831,
      },
      bbox: [-74.0479, 40.6794, -73.9067, 40.8820],
    });

    geocoder.on('result', (e) => {
      const { coordinates } = e.result.geometry;
      const placeName = e.result.place_name;

      console.log('Geocoding coordinates: ', coordinates);
      console.log('Geocoding name: ', placeName);

      setCoordinates(coordinates);
      setPlaceName && setPlaceName(placeName);  // Only call setPlaceName if it's defined

      if (geocoderRef) {
        geocoderRef.current = geocoder;
      }
    });

    const container = geocoderContainer.current;
    if (container) {
      container.innerHTML = "";
      container.appendChild(geocoder.onAdd());
    }

    if (geocoderRef) {
      geocoderRef.current = geocoder;
    }
  }, [setCoordinates, setPlaceName, geocoderRef]);

  return (
    <div className="location_input_container" ref={ref}>
      <div ref={geocoderContainer}></div>
    </div>
  );
});

export default LocationInput;
