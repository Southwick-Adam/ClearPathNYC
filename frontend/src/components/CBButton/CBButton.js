import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import useStore from '../../store/store';
import './CBButton.css';
import defaultModeImage from '../../assets/images/CBButton_off.png';
import colorBlindModeImage from '../../assets/images/CBButton_on.png';

function CBButton() {
  const { isColorBlindMode, toggleColorBlindMode } = useStore();

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Color-blind Mode
    </Tooltip>
  );

  return (
    <div className="cb_button_container">
      <OverlayTrigger placement="top" overlay={renderTooltip}>
        <button onClick={toggleColorBlindMode} className={`toggle_cb_mode ${isColorBlindMode ? 'color-blind' : 'normal'}`}>
          <img src={isColorBlindMode ? colorBlindModeImage : defaultModeImage} alt="mode" className="cb_button_image" />
          <span className="cb_button_text">{isColorBlindMode ? 'ON' : 'OFF'}</span>
        </button>
      </OverlayTrigger>
    </div>
  );
}

export default CBButton;
