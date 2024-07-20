import React, { useRef, useId } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ViewLayerToggle.css';
import useStore from '../../store/store';

const ViewLayerToggle = ({ isChecked, onToggle, tooltipText, isDisabled, className }) => {
  const inputRef = useRef(null);
  const uniqueId = useId();
  const isColorBlindMode = useStore((state) => state.isColorBlindMode);

  const renderTooltip = (props) => (
    <Tooltip id={`tooltip-${uniqueId}`} {...props}>
      {tooltipText}
    </Tooltip>
  );

  return (
    <div className={`toggle-switch-container ${isColorBlindMode ? 'color-blind-mode' : ''} ${isDisabled ? 'disabled' : ''} ${className}`}>
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={uniqueId}
          ref={inputRef}
          className="toggle-switch-checkbox"
          checked={isChecked}
          onChange={onToggle}
          disabled={isDisabled}
        />
        <OverlayTrigger placement="top" overlay={renderTooltip}>
          <label className="toggle-switch-label" htmlFor={uniqueId}>
            <span className="toggle-switch-switch"></span>
          </label>
        </OverlayTrigger>
      </div>
    </div>
  );
};

export default ViewLayerToggle;
