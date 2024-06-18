import React, { useRef, useId } from 'react';
import './BusyToggleSwitch.css';

const BusyToggleSwitch = ({ mode, handleToggleChange }) => {

  const inputRef = useRef(null);
  const uniqueId = useId();

  return (
    <div className="toggle-switch-container">
      <span className="toggle-label">Busy</span>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={uniqueId}
          ref={inputRef}
          className="toggle-switch-checkbox"
          checked={mode === 'quiet'}
          onChange={() => handleToggleChange(mode === 'quiet' ? 'busy' : 'quiet')}
        />
        <label className="toggle-switch-label" htmlFor={uniqueId}>
          <span className="toggle-switch-switch"></span>
        </label>
      </div>
      <span className="toggle-label">Quiet</span>
    </div>
  );
};

export default BusyToggleSwitch;
