import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent/MapComponent.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import SmogAlert from './components/SmogAlert/SmogAlert.js';
import WeatherPanel from './components/WeatherPanel/WeatherPanel.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import { samplegeojson } from './smallergeojson.js';
import SplashScreen from './components/SplashScreen/SplashScreen.js';

function App() {
  const [route, setRoute] = useState(null);
  const [weather, setWeather] = useState(null); // State to hold weather data

  const startGeocoderRef = useRef(null);
  const endGeocoderRef = useRef(null);
  const geocoderRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  async function handleFormSubmit(formType, formData) {
    console.log('handleFormSubmit called with formType:', formType);
    console.log(`Form data for ${formType} sent to backend: `, formData);

    // Fetch the route data from the backend
    const routeData = await fetchRoute(formData);

    if (routeData) {
      console.log('Fetched route data:', routeData);
      setRoute(routeData);
    }
  }

  async function fetchRoute(formData) {
    const { coordinates } = formData;

    // Create query parameters from coordinates
    const params = new URLSearchParams();
    coordinates.forEach((coord) => {
      params.append('coord1', parseFloat(coord[1])); // Latitude as double
      params.append('coord2', parseFloat(coord[0])); // Longitude as double
    });

    const requestUrl = `http://localhost:5056/route?${params.toString()}`;
    console.log('Request URL:', requestUrl);

    try {
      const response = await fetch(requestUrl);
      const responseText = await response.text();
      console.log('Response Text:', responseText);
      const data = JSON.parse(responseText);
      return data;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  }

  async function fetchWeatherData() {
    const apiUrl = 'http://localhost:5056/weather';
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(data);
      setWeather(data); 
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  useEffect(() => {
    fetchWeatherData(); // Fetch weather data when component mounts
  }, []);

  const epaIndex = weather ? weather.current.air_quality['us-epa-index'] : null;

  return (
    <div className="App">
      <SplashScreen />
      <SmogAlert epaIndex={epaIndex} />
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
