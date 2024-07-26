import React, { useState, useEffect } from 'react';
import './Legend.css';
import useStore from '../../store/store';
import ViewLayerToggle from '../ViewLayerToggle/ViewLayerToggle';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

function Legend({ onToggleLayer, layerVisibility, presentLayers }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isNightMode, routes, selectedRouteIndex, isColorBlindMode } = useStore();
  const route = routes[selectedRouteIndex];

  useEffect(() => {
    if (window.innerWidth > 480) {
      const legendTimer = setTimeout(() => {
        setIsOpen(true);
      }, 3500); // Adjust the delay as needed

      return () => {
        clearTimeout(legendTimer);
      };
    }
  }, []);

  function toggleLegend() {
    setIsOpen(!isOpen);
  }

  function hideLegend() {
    setIsOpen(false);
  }

  const handleButtonClick = (layerName) => {
    onToggleLayer(layerName, !layerVisibility[layerName]);
  };

  const renderToggleButton = (layerName) => {
    return (
      <ViewLayerToggle
        isChecked={layerVisibility[layerName]}
        onToggle={() => handleButtonClick(layerName)}
        tooltipText={`View/Hide ${layerName}`}
        className={`toggle-${layerName}`} // Add a className prop based on the layerName
      />
    );
  };

  const renderDisableableButton = (layerName) => {
    const isDisabled = !presentLayers[layerName];
    const tooltipText = route
      ? 'None found near the route'
      : 'View after finding a route';

    const button = (
      <ViewLayerToggle
        isChecked={layerVisibility[layerName]}
        onToggle={() => handleButtonClick(layerName)}
        tooltipText={tooltipText}
        isDisabled={isDisabled}
        className={`toggle-${layerName}`}
      />
    );

    if (isDisabled) {
      return (
        <OverlayTrigger
          key={layerName}
          placement="top"
          overlay={<Tooltip id={`tooltip-${layerName}`}>{tooltipText}</Tooltip>}
        >
          <span className="d-inline-block">{button}</span>
        </OverlayTrigger>
      );
    }

    return button;
  };

  const greenPinSrc = isColorBlindMode
    ? require('../../assets/images/green_CB.png')
    : require('../../assets/images/pin_green.png');

  return (
    <div className={`legend ${isOpen ? 'open' : ''} ${isNightMode ? 'night' : 'day'}`}>
      <button
        className={`btn btn-primary toggle-btn-legend ${isNightMode ? 'night' : 'day'} ${isColorBlindMode ? 'color-blind' : ''}`}
        onClick={toggleLegend}
      >
        {isOpen ? '▶' : '◀'}
      </button>
      <div className="legend-content">
        <ul>
          <li>
            <img src={require('../../assets/images/PTP_A_flat.png')} alt="Point to Point starting location" />
            Start Location
          </li>
          <li>
            <img src={require('../../assets/images/PTP_B_flat.png')} alt="Point to Point end location" />
            End location
          </li>
          <li>
            <img src={require('../../assets/images/Waypoint_flat.png')} alt="Waypoint Marker" />
            Waypoint
          </li>
          <li>
            <img src={require('../../assets/images/Park_flat.png')} alt="Park" />
            Park
            <div className="button-container">
              {renderToggleButton('parks')}
            </div>
          </li>
          <li>
            <img src={require('../../assets/images/PoI_flat.png')} alt="Point of Interest" />
            Point of Interest
            <div className="button-container">
              {renderToggleButton('poi')}
            </div>
          </li>
          <li>
            <img src={require('../../assets/images/Noise_flat.png')} alt="Noise Warning" />
            Noise Warning
            <div className="button-container">
              {presentLayers.noise ? renderToggleButton('noise') : renderDisableableButton('noise')}
            </div>
          </li>
          <li>
            <img src={require('../../assets/images/Bin_flat.png')} alt="Trash Warning" />
            Trash Warning
            <div className="button-container">
              {presentLayers.trash ? renderToggleButton('trash') : renderDisableableButton('trash')}
            </div>
          </li>
          <li>
            <img src={require('../../assets/images/Road_Warning_flat.png')} alt="Street Condition Warning" />
            Street Condition Warning
            <div className="button-container">
              {presentLayers.other ? renderToggleButton('other') : renderDisableableButton('other')}
            </div>
          </li>
          <li>
            <img src={require('../../assets/images/Warning_flat.png')} alt="Multiple Warnings" />
            Multiple Warnings
            <div className="button-container">
              {presentLayers.multipleWarnings ? renderToggleButton('multipleWarnings') : renderDisableableButton('multipleWarnings')}
            </div>
          </li>
          <li>
            <img src={require('../../assets/images/pin_blue.png')} alt="Blue Pin" />
            Point of Interest
          </li>
          <li>
            <img src={greenPinSrc} alt="Green Pin" />
            Parks
          </li>
          <li>
            <img src={require('../../assets/images/pin_orange.png')} alt="Orange Pin" />
            Frequent 311 Warning
          </li>
          <li>
            <img src={require('../../assets/images/pin_red.png')} alt="Red Pin" />
            Severe 311 Warning
          </li>
        </ul>
        <div className="legend-bar-container">
        <span className="legend-bar-title">Route Coloring</span>
          <div className="legend-bar">
          <div className={`legend-bar-segment ${isColorBlindMode ? 'purple' : 'green'}`}></div>
            <div className="legend-bar-segment orange"></div>
            <div className="legend-bar-segment red"></div>
          </div>
          <div className="legend-bar-labels">
            <span className="legend-bar-label">Quiet</span>
            <span className="legend-bar-label">Medium</span>
            <span className="legend-bar-label">Busy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Legend;
