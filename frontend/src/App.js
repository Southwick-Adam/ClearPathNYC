import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent/MapComponent.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import SmogAlert from './components/SmogAlert/SmogAlert.js';
import WeatherPanel from './components/WeatherPanel/WeatherPanel.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import SplashScreen from './components/SplashScreen/SplashScreen.js';
import Legend from './components/Legend/Legend.js';
import useStore from './store/store.js';

function App() {
  const [route, setRoute] = useState(null);
  const [weather, setWeather] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);

  const startGeocoderRef = useRef(null);
  const endGeocoderRef = useRef(null);
  const geocoderRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const { isNightMode, setNightMode } = useStore();

  const [layerVisibility, setLayerVisibility] = useState({
    parks: true,
    poi: true,
    noise: true,
    trash: true,
    multipleWarnings: true,
  });

  const toggleLayerVisibility = (layer) => {
    setLayerVisibility((prevVisibility) => ({
      ...prevVisibility,
      [layer]: !prevVisibility[layer],
    }));
  };

  async function handleFormSubmit(formType, formData) {
    console.log('handleFormSubmit called with formType:', formType);
    console.log(`Form data for ${formType} sent to backend: `, formData);

    const routeData = await fetchRoute(formData);

    if (routeData) {
      console.log('Fetched route data:', routeData);
      setRoute(routeData);
    }
  }

  async function fetchRoute(formData) {
    const { coordinates } = formData;

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

      // Update the route in the store
      useStore.getState().setRoute(data);

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
    fetchWeatherData();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour <= 6; // Night mode between 6 PM and 6 AM
    setNightMode(isNight);
  }, [setNightMode]);

  const epaIndex = weather ? weather.current.air_quality['us-epa-index'] : null;

  return (
    <div className="App">
      <SplashScreen setPlayVideo={setPlayVideo} />
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
        playVideo={playVideo} // Pass playVideo prop
        layerVisibility={layerVisibility} // Pass layer visibility state
      />
      <Legend onToggleLayer={toggleLayerVisibility} /> {/* Pass toggle function */}
      <WeatherPanel weather={weather} />
    </div>
  );
}

export default App;

