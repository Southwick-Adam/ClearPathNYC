import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import useStore from '../../store/store';
import './NightModeButton.css';

function NightModeButton() {
  const { isNightMode, toggleNightMode } = useStore();

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Night Mode
    </Tooltip>
  );

  return (
    <div className="night_button_container">
      <OverlayTrigger placement="top" overlay={renderTooltip}>
        <button onClick={toggleNightMode} className={`toggle_night_mode ${isNightMode ? 'day' : 'night'}`}>
          {isNightMode ? '☀️' : '🌙 '}
        </button>
      </OverlayTrigger>
    </div>
  );
}

export default NightModeButton;
