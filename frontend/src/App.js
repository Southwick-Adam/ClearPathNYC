import React, { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent/MapComponent.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import SmogAlert from './components/SmogAlert/SmogAlert.js';
import WeatherPanel from './components/WeatherPanel/WeatherPanel.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import SplashScreen from './components/SplashScreen/SplashScreen.js';
import Legend from './components/Legend/Legend.js';
import useStore from './store/store.js';
import './App.css';

function App() {
  const [weather, setWeather] = useState(null);
  const [playVideo, setPlayVideo] = useState(false);
  const [presentLayers, setPresentLayers] = useState({
    parks: true,
    poi: true,
    noise: false,
    trash: false,
    multipleWarnings: false,
    other: false,
  });

  const loopGeocoderRef = useRef(null);
  const startGeocoderRef = useRef(null);
  const endGeocoderRef = useRef(null);
  const geocoderRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const { isNightMode, routes, selectedRouteIndex, setRoutes, setSelectedRouteIndex } = useStore();

  const [layerVisibility, setLayerVisibility] = useState({
    parks: true,
    poi: true,
    noise: false,
    trash: false,
    multipleWarnings: false,
    other: false,
  });

  const toggleLayerVisibility = (layer, isVisible) => {
    setLayerVisibility((prevVisibility) => ({
      ...prevVisibility,
      [layer]: isVisible,
    }));
  };

  async function handleFormSubmit(formType, formData) {
    console.log('handleFormSubmit called with formType:', formType);
    console.log(`Form data for ${formType} sent to backend: `, formData);

    let routeData;
    if (formType === 'loop') {
      routeData = await fetchLoopRoute(formData);
    } else if (formType === 'pointToPoint') {
      if (formData.isMultiP2P) {
        routeData = await fetchMultiP2PRoute(formData);
      } else {
        routeData = await fetchP2PRoute(formData);
      }
    }

    if (routeData) {
      console.log('Fetched route data:', routeData);
      if (Array.isArray(routeData.features)) {
        setRoutes(routeData.features);
        setSelectedRouteIndex(0); // Auto-select the first route
      } else {
        setRoutes([routeData]);
        setSelectedRouteIndex(0); // Auto-select the single route
      }
    }
  }

  async function fetchP2PRoute(formData) {
    const { coordinates, isQuiet } = formData;

    const params = new URLSearchParams();
    coordinates.forEach((coord) => {
      params.append('coord1', parseFloat(coord[1])); // Latitude as double
      params.append('coord2', parseFloat(coord[0])); // Longitude as double
    });
    params.append('quiet', isQuiet); // Add the quiet parameter

    const requestUrl = `http://localhost:5056/route/p2p?${params.toString()}`;
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

  async function fetchMultiP2PRoute(formData) {
    const { coordinates, isQuiet } = formData;

    const params = new URLSearchParams();
    coordinates.forEach((coord) => {
      params.append('coord1', parseFloat(coord[1])); // Latitude as double
      params.append('coord2', parseFloat(coord[0])); // Longitude as double
    });
    params.append('quiet', isQuiet); // Add the quiet parameter

    const requestUrl = `http://localhost:5056/route/multip2p?${params.toString()}`;
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

  async function fetchLoopRoute(formData) {
    const { coordinates, distance, mode } = formData;

    const params = new URLSearchParams();
    params.append('coordinate', parseFloat(coordinates[0])); //Flipped here so it's not reversed
    params.append('coordinate', parseFloat(coordinates[1]));
    params.append('distance', distance);
    params.append('quiet', mode);

    const requestUrl = `http://localhost:5056/route/loop?${params.toString()}`;
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
    fetchWeatherData();
  }, []);

  // Sync layerVisibility with presentLayers after route is generated
  useEffect(() => {
    if (routes.length > 0) {
      const updatedVisibility = { ...layerVisibility };
      Object.keys(presentLayers).forEach((layer) => {
        if (presentLayers[layer]) {
          updatedVisibility[layer] = true;
        }
      });
      setLayerVisibility(updatedVisibility);
    }
  }, [routes, presentLayers]); // Update visibility when route or presentLayers change

  const epaIndex = weather ? weather.current.air_quality['us-epa-index'] : null;

  return (
    <div className="App">
      <SplashScreen setPlayVideo={setPlayVideo} />
      <SmogAlert epaIndex={epaIndex} />
      <Sidebar
        loopGeocoderRef={loopGeocoderRef}
        onFormSubmit={handleFormSubmit}
        startGeocoderRef={startGeocoderRef}
        endGeocoderRef={endGeocoderRef}
        geocoderRefs={geocoderRefs}
      />
      <div className="route-tabs">
        {routes.length > 1 && (
          <>
            {routes.map((route, index) => (
              <button
                key={index}
                className={index === selectedRouteIndex ? 'active' : ''}
                onClick={() => setSelectedRouteIndex(index)}
              >
                Route {index + 1}
              </button>
            ))}
          </>
        )}
      </div>
      <MapComponent
        route={routes[selectedRouteIndex]} // Pass the selected route
        startGeocoderRef={startGeocoderRef}
        endGeocoderRef={endGeocoderRef}
        geocoderRefs={geocoderRefs}
        playVideo={playVideo} // Pass playVideo prop
        layerVisibility={layerVisibility} // Pass layer visibility state
        setPresentLayers={setPresentLayers} // Pass the setter for present layers
      />
      <Legend onToggleLayer={toggleLayerVisibility} layerVisibility={layerVisibility} presentLayers={presentLayers} /> {/* Pass toggle function and present layers */}
      <WeatherPanel weather={weather} />
    </div>
  );
}

export default App;
