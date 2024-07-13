import React, { useState, useEffect } from 'react';
import './Legend.css';
import useStore from '../../store/store';

function Legend({ onFormSubmit, startGeocoderRef, endGeocoderRef, geocoderRefs }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isNightMode } = useStore();

  useEffect(() => {
    const legendTimer = setTimeout(() => {
      setIsOpen(true);
    }, 3500); // Adjust the delay as needed

    return () => {
      clearTimeout(legendTimer);
    };
  }, []);

  function toggleLegend() {
    setIsOpen(!isOpen);
  }

  function hideLegend() {
    setIsOpen(false);
  }

  return (
    <div className={`legend ${isOpen ? 'open' : ''} ${isNightMode ? 'night' : 'day'}`}>
      <button className={`btn btn-primary toggle-btn-legend ${isNightMode ? 'night' : 'day'}`} onClick={toggleLegend}>
        {isOpen ? '◀' : '▶'}
      </button>
      <div className="legend-content">
        <ul>
          <li><img src={require('../../assets/images/PTP_A_flat.png')} alt="Point to Point starting location" />Point to Point starting location</li>
          <li><img src={require('../../assets/images/PTP_B_flat.png')} alt="Point to Point end location" />Point to Point end location</li>
          <li><img src={require('../../assets/images/Waypoint_flat.png')} alt="Waypoint Marker" />Waypoint Marker</li>
          <li><img src={require('../../assets/images/Park_flat.png')} alt="Park" />Park</li>
          <li><img src={require('../../assets/images/PoI_flat.png')} alt="Point of Interest" />Point of Interest</li>
          <li><img src={require('../../assets/images/Noise_flat.png')} alt="Noise Warning" />Noise Warning</li>
          <li><img src={require('../../assets/images/Bin_flat.png')} alt="Trash Warning" />Trash Warning</li>
          <li><img src={require('../../assets/images/Warning_flat.png')} alt="Multiple Warnings" />Multiple Warnings</li>
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
