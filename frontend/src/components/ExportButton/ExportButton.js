import React from 'react';
import useStore from '../../store/store';
import { geojsonToGpx } from '../MapComponent/MapHelper/geojsonHelpers';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './ExportButton.css';

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
          disabled={!route} // Disable the button if no route
        >
          Export to GPX
        </button>
      </OverlayTrigger>
    </div>
  );
};

export default ExportButton;
