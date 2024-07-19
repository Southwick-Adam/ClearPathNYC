import React, { useRef, useId } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BusyToggleSwitch.css';
import useStore from '../../store/store';

const BusyToggleSwitch = ({ isQuiet, handleToggleChange }) => {
  const inputRef = useRef(null);
  const uniqueId = useId();
  const isColorBlindMode = useStore((state) => state.isColorBlindMode);

  const renderTooltip = (props) => (
    <Tooltip id="toggle-tooltip" {...props}>
      Toggle to find a quieter route
    </Tooltip>
  );

  return (
    <div className={`toggle-switch-container ${isColorBlindMode ? 'color-blind-mode' : ''}`}>
      <span className="toggle-label">Busy</span>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={uniqueId}
          ref={inputRef}
          className="toggle-switch-checkbox"
          checked={isQuiet}
          onChange={handleToggleChange}
        />
        <OverlayTrigger placement="top" overlay={renderTooltip}>
          <label className="toggle-switch-label" htmlFor={uniqueId}>
            <span className="toggle-switch-switch"></span>
          </label>
        </OverlayTrigger>
      </div>
      <span className="toggle-label">Quiet</span>
    </div>
  );
};

export default BusyToggleSwitch;
