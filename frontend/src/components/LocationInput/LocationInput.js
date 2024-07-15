import React, { useEffect, useRef, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '../../../node_modules/@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './LocationInput.css';
import { MAPBOX_TOKEN } from '../../config';
import useStore from '../../store/store';

mapboxgl.accessToken = MAPBOX_TOKEN;

const LocationInput = forwardRef(({ setCoordinates, setPlaceName, geocoderRef }, ref) => {
  const geocoderContainer = useRef(null);
  const { isNightMode } = useStore();

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
      setPlaceName && setPlaceName(placeName);

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

    const geocoderElement = container.querySelector('.mapboxgl-ctrl-geocoder');
    if (geocoderElement) {
      if (isNightMode) {
        geocoderElement.classList.add('night');
        geocoderElement.classList.remove('day');
      } else {
        geocoderElement.classList.add('day');
        geocoderElement.classList.remove('night');
      }
    }
  }, [setCoordinates, setPlaceName, geocoderRef, isNightMode]);

  return (
    <div className={`location_input_container ${isNightMode ? 'night' : 'day'}`} ref={ref}>
      <div ref={geocoderContainer}></div>
    </div>
  );
});

export default LocationInput;
