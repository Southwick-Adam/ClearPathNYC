import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent/MapComponent.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import SmogAlert from './components/SmogAlert/SmogAlert.js';
import WeatherPanel from './components/WeatherPanel/WeatherPanel.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import { samplegeojson } from './smallergeojson.js';

function App() {
  const [route, setRoute] = useState(null);
  const [weather, setWeather] = useState(null); // State to hold weather data

  const startGeocoderRef = useRef(null);
  const endGeocoderRef = useRef(null);
  const geocoderRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Simulate fetching geoJson data from backend
  function simulateFetchRoute(formType, formData) {
    console.log('simulateFetchRoute called with formType:', formType); 
    let routeData;

    if (formType === 'loop') {
      console.log('Generating loop route data...');
      routeData = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": [
                [-73.9712, 40.7831], 
                [-73.9710, 40.7840], 
                [-73.9700, 40.7840], 
                [-73.9690, 40.7840], 
                [-73.9690, 40.7831], 
                [-73.9690, 40.7822], 
                [-73.9700, 40.7822], 
                [-73.9710, 40.7822], 
                [-73.9712, 40.7831]
              ]
            },
            "properties": {
              "name": "Loop Route",
              "isLoop": true,
              "quietness_score": [5, 6, 7, 8, 7, 6, 5, 4, 5]
            }
          }
        ]
      };
    } else if (formType === 'pointToPoint') {
      console.log('Generating point to point route data...');
      routeData = samplegeojson;
    }
    console.log('Simulated route data:', routeData);
    setRoute(routeData);
  }

  function handleFormSubmit(formType, formData) {
    console.log('handleFormSubmit called with formType:', formType); // Dev log, remove later
    // Simulate sending the form data to the backend, replace with API calls in future
    setTimeout(() => {
      console.log(`Form data for ${formType} sent to backend: `, formData);

      // Simulate fetching the route data after form submission
      simulateFetchRoute(formType, formData);
    }, 1000); // Simulate network delay of 1 second, remove in future
  }

  async function fetchWeatherData() {
    const apiUrl = '/weather';
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  useEffect(() => {
    fetchWeatherData(); // Fetch weather data when component mounts
  }, []);

  return (
    <div className="App">
      <SplashScreen />
      <SmogAlert />
      <Sidebar
        onFormSubmit={handleFormSubmit}
        startGeocoderRef={startGeocoderRef}
        endGeocoderRef={endGeocoderRef}
        geocoderRefs={geocoderRefs}
      />
      <MapComponent
        route={route}
        startGeocoderRef={startGeocoderRef}
        endGeocoderRef={endGeocoderRef}
        geocoderRefs={geocoderRefs}
      />
      <WeatherPanel weather={weather} /> {/* Pass weather data to WeatherPanel */}
    </div>
  );
}

export default App;
