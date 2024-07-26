import React from 'react';
import './LoadingPopup.css';
import { BsExclamationTriangleFill } from 'react-icons/bs';
import loadingGif from '../../assets/images/runner.gif';

const LoadingPopup = ({ message, status, onClose }) => (
  <div className="loading-popup">
    <div className="loading-popup-content">
      <button className="close-button" onClick={onClose}>✖</button>
      {status === 'error' ? (
        <BsExclamationTriangleFill className="error-icon" />
      ) : (
        <img src={loadingGif} alt="loading" className="loading-popup-gif" />
      )}
      <div className="loading-popup-message">{message}</div>
    </div>
  </div>
);

export default LoadingPopup;