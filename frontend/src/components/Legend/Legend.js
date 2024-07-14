import React, { useState, useEffect } from 'react';
import './Legend.css';
import useStore from '../../store/store';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';

function Legend({ onToggleLayer, layerVisibility, presentLayers }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isNightMode, route } = useStore();
  const [buttonText, setButtonText] = useState({
    parks: 'Hide',
    poi: 'Hide',
    noise: 'View',
    trash: 'View',
    multipleWarnings: 'View',
    other: 'View'
  });

  useEffect(() => {
    const legendTimer = setTimeout(() => {
      setIsOpen(true);
    }, 3500); // Adjust the delay as needed

    return () => {
      clearTimeout(legendTimer);
    };
  }, []);

  useEffect(() => {
    if (route) {
      setButtonText((prevText) => ({
        ...prevText,
        noise: presentLayers.noise ? 'Hide' : 'View',
        trash: presentLayers.trash ? 'Hide' : 'View',
        multipleWarnings: presentLayers.multipleWarnings ? 'Hide' : 'View',
        other: presentLayers.other ? 'Hide' : 'View' // Ensure 'other' is handled similarly
      }));
    }
  }, [route, presentLayers]);

  function toggleLegend() {
    setIsOpen(!isOpen);
  }

  function hideLegend() {
    setIsOpen(false);
  }

  const handleButtonClick = (layerName) => {
    setButtonText((prevText) => ({
      ...prevText,
      [layerName]: prevText[layerName] === 'Hide' ? 'View' : 'Hide'
    }));
    onToggleLayer(layerName);
  };

  const renderToggleButton = (layerName) => {
    return (
      <Button
        onClick={() => handleButtonClick(layerName)}
        className="toggle-button"
      >
        {buttonText[layerName]}
      </Button>
    );
  };

  const renderDisableableButton = (layerName) => {
    const isDisabled = !route || !presentLayers[layerName];
    const button = (
      <Button
        onClick={() => handleButtonClick(layerName)}
        disabled={isDisabled}
        className={`toggle-button ${isDisabled ? 'disabled' : ''}`}
      >
        {buttonText[layerName]}
      </Button>
    );

    const tooltipText = !route
      ? 'View after finding a route'
      : 'None found near the route';

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

  return (
    <div className={`legend ${isOpen ? 'open' : ''} ${isNightMode ? 'night' : 'day'}`}>
      <button className={`btn btn-primary toggle-btn-legend ${isNightMode ? 'night' : 'day'}`} onClick={toggleLegend}>
        {isOpen ? '◀' : '▶'}
      </button>
      <div className="legend-content">
        <ul>
          <li>
            <img src={require('../../assets/images/PTP_A_flat.png')} alt="Point to Point starting location" />
            Point to Point starting location
          </li>
          <li>
            <img src={require('../../assets/images/PTP_B_flat.png')} alt="Point to Point end location" />
            Point to Point end location
          </li>
          <li>
            <img src={require('../../assets/images/Waypoint_flat.png')} alt="Waypoint Marker" />
            Waypoint Marker
          </li>
          <li>
            <img src={require('../../assets/images/Park_flat.png')} alt="Park" />
            Park
            {renderToggleButton('parks')}
          </li>
          <li>
            <img src={require('../../assets/images/PoI_flat.png')} alt="Point of Interest" />
            Point of Interest
            {renderToggleButton('poi')}
          </li>
          <li>
            <img src={require('../../assets/images/Noise_flat.png')} alt="Noise Warning" />
            Noise Warning
            {renderDisableableButton('noise')}
          </li>
          <li>
            <img src={require('../../assets/images/Bin_flat.png')} alt="Trash Warning" />
            Trash Warning
            {renderDisableableButton('trash')}
          </li>
          <li>
            <img src={require('../../assets/images/Road_Warning_flat.png')} alt="Street Condition Warning" />
            Street Condition Warning
            {renderDisableableButton('other')}
          </li>
          <li>
            <img src={require('../../assets/images/Warning_flat.png')} alt="Multiple Warnings" />
            Multiple Warnings
            {renderDisableableButton('multipleWarnings')}
          </li>
          <li>
            <img src={require('../../assets/images/pin_blue.png')} alt="Blue Pin" />
            <img src={require('../../assets/images/pin_green.png')} alt="Green Pin" />
            <img src={require('../../assets/images/pin_yellow.png')} alt="Yellow Pin" />
            <img src={require('../../assets/images/pin_orange.png')} alt="Orange Pin" />
            <img src={require('../../assets/images/pin_red.png')} alt="Red Pin" />
          </li>
          <li>Pin colour indicates level of volume, with red being the greatest.</li>
          <li>Blue and Green pins represent items of interest to the user.</li>
        </ul>
      </div>
    </div>
  );
}

export default Legend;
