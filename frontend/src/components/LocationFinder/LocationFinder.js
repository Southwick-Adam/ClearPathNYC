// import React, { useRef } from 'react';
// import LocationInput from '../LocationInput/LocationInput';
// import './LocationFinder.css';
// import AutoLocationButton from '../AutoLocationButton/AutoLocationButton';

// const LocationFinder = ({ setCoordinates }) => {
//   const geocoderRef = useRef(null);

//   return (
//     <div className="location_finder_container">
//       <LocationInput setCoordinates={setCoordinates} geocoderRef={geocoderRef} />
//       <AutoLocationButton setCoordinates={setCoordinates} geocoderRef={geocoderRef} />
//     </div>
//   );
// };

// export default LocationFinder;

import React, { forwardRef } from 'react';
import LocationInput from '../LocationInput/LocationInput';
import AutoLocationButton from '../AutoLocationButton/AutoLocationButton';
import './LocationFinder.css';
const LocationFinder = forwardRef(({ setCoordinates, geocoderRef }, ref) => {
  return (
    <div ref={ref} className="location_finder_container">
      <LocationInput setCoordinates={setCoordinates} geocoderRef={geocoderRef} />
      <AutoLocationButton setCoordinates={setCoordinates} geocoderRef={geocoderRef} />
    </div>
  );
});

export default LocationFinder;
