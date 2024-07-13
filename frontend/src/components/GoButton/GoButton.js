import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './GoButton.css';

const GoButton = ({ disabled }) => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="tooltip-disabled">{disabled ? 'Please fill all input fields first' : ''}</Tooltip>}
    >
      <span className="d-inline-block">
        <Button type="submit" className={`go_button ${disabled ? 'disabled' : ''}`} disabled={disabled}>
          GO!
        </Button>
      </span>
    </OverlayTrigger>
  );
};

export default GoButton;
