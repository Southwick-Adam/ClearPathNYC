import React from 'react';
import MapComponent from './components/MapComponent/MapComponent.js';
import Sidebar from './components/Sidebar/Sidebar.js';
import SmogAlert from './components/SmogAlert/SmogAlert.js';
import WeatherPanel from './components/WeatherPanel/WeatherPanel.js';


function App() {
  return (
    <div className="App">
      <SmogAlert />
      <Sidebar />
      <MapComponent />
      <WeatherPanel />
    </div>
  );
}

export default App;
