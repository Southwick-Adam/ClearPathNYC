import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { MAPBOX_TOKEN, MAPBOX_GEOCODING_URL } from '../../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AutoLocationButton.css';
import useStore from '../../store/store';

function AutoLocationButton({ setCoordinates, geocoderRef }) {
  const findMyLocation = async () => {
    const simulatedCoordinates = [-73.9712, 40.7831];
    setCoordinates(simulatedCoordinates);

    const response = await fetch(`${MAPBOX_GEOCODING_URL}/${simulatedCoordinates[0]},${simulatedCoordinates[1]}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const placeName = data.features[0].place_name;
      if (geocoderRef.current) {
        geocoderRef.current.setInput(placeName);
      }
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Find my location
    </Tooltip>
  );

  const isColorBlindMode = useStore((state) => state.isColorBlindMode);
  const isNightMode = useStore((state) => state.isNightMode); // Get night mode state

  return (
    <div className={`autobutton ${isColorBlindMode ? 'color-blind-mode' : ''} ${isNightMode ? 'night-mode' : ''}`}>
      <OverlayTrigger placement="top" overlay={renderTooltip}>
        <svg onClick={findMyLocation} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-geo-fill" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.3 1.3 0 0 0-.37.265.3.3 0 0 0-.057.09V14l.002.008.016.033a.6.6 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.6.6 0 0 0 .146-.15l.015-.033L12 14v-.004a.3.3 0 0 0-.057-.09 1.3 1.3 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465s-2.462-.172-3.34-.465c-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411"/>
        </svg>
      </OverlayTrigger>
    </div>
  );
}

export default AutoLocationButton;
