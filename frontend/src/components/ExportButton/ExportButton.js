// components/ExportButton/ExportButton.js
import React from 'react';
import useStore from '../../store/store'
import { geojsonToGpx } from '../MapComponent/MapHelper/geojsonHelpers';
import './ExportButton.css'

const ExportButton = () => {
    const route = useStore(state => state.route);
  
    const handleExport = () => {
      if (!route) {
        alert('No route to export');
        return;
      }
  
      const gpx = geojsonToGpx(route);
      const blob = new Blob([gpx], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'route.gpx';
      a.click();
      URL.revokeObjectURL(url);
    };
  
    return (
      <button 
        onClick={handleExport} 
        className="export-button" 
        disabled={!route} // Disable the button if no route
      >
        Export to GPX
      </button>
    );
  };
  
  export default ExportButton;
