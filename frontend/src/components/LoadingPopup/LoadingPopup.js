import React from 'react';
import './LoadingPopup.css';

const LoadingPopup = ({ message, onClose }) => (
  <div className="loading-popup">
    <div className="loading-popup-content">
      <button className="close-button" onClick={onClose}>✖</button>
      {message}
    </div>
  </div>
);

export default LoadingPopup;