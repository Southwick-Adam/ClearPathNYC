import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import useStore from '../../store/store';
import './GoButton.css';

const GoButton = ({ disabled }) => {
  const isColorBlindMode = useStore(state => state.isColorBlindMode);

  const buttonClass = `go_button ${disabled ? 'disabled' : ''} ${isColorBlindMode ? 'color-blind' : ''}`;

  if (disabled) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-disabled">Please fill all input fields first</Tooltip>}
      >
        <span className="d-inline-block">
          <Button type="submit" className={buttonClass} disabled={disabled}>
            GO!
          </Button>
        </span>
      </OverlayTrigger>
    );
  } else {
    return (
      <Button type="submit" className={buttonClass} disabled={disabled}>
        GO!
      </Button>
    );
  }
};

export default GoButton;

