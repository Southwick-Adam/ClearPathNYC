import React from 'react';
import useStore from '../../store/store';
import { geojsonToGpx } from '../MapComponent/MapHelper/geojsonHelpers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './ExportButton.css';

const ExportButton = () => {
  const routes = useStore(state => state.routes);
  const selectedRouteIndex = useStore(state => state.selectedRouteIndex);

  const handleExport = () => {
    if (!routes || routes.length === 0 || selectedRouteIndex === null || selectedRouteIndex >= routes.length) {
      alert('No route to export');
      return;
    }

    const selectedRoute = routes[selectedRouteIndex];
    const gpx = geojsonToGpx(selectedRoute);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route.gpx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Export your route to GPX for uploading to Strava and Garmin.
    </Tooltip>
  );

  return (
    <div className="export-button-container">
      <OverlayTrigger placement="top" overlay={renderTooltip}>
        <button
          onClick={handleExport}
          className="export-button"
          disabled={!routes || routes.length === 0 || selectedRouteIndex === null || selectedRouteIndex >= routes.length}
        >
          Export to GPX
        </button>
      </OverlayTrigger>
    </div>
  );
};

export default ExportButton;