import React from 'react';
import { Button } from 'react-bootstrap';
import { MAPBOX_TOKEN, MAPBOX_GEOCODING_URL } from '../../config';
import mapboxgl from 'mapbox-gl';



mapboxgl.accessToken = MAPBOX_TOKEN

function AutoLocationButton({ setCoordinates, geocoderRef }){
  const findMyLocation= async () => {
    // Simulated location in central manhattan 
    const simulatedCoordinates = [-73.9712, 40.7831];
    setCoordinates(simulatedCoordinates);

    //Use mapbox to reverse geocode to get the address of the coordinates
    const response = await fetch(`${MAPBOX_GEOCODING_URL}/${simulatedCoordinates[0]},${simulatedCoordinates[1]}.json?access_token=${MAPBOX_TOKEN}`)
    const data = await response.json();

    if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name;
        if (geocoderRef.current) {
          geocoderRef.current.setInput(placeName);
        }
      }
  };

  return (
    <Button variant="primary" onClick={findMyLocation} style={{ marginLeft: '10px' }}>
      My Location
    </Button>
  );
};

export default AutoLocationButton;
