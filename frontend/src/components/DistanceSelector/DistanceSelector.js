import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import useStore from '../../store/store';
import './DistanceSelector.css';

const DistanceSelector = ({ distance, onDistanceChange }) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    // Allow empty input to support deletion
    if (newValue === '') {
      onDistanceChange(0); // Use 0 to indicate no value
    } else {
      const newValueNumber = Number(newValue);
      // Validation for non-negative distance
      if (!isNaN(newValueNumber) && newValueNumber >= 0) {
        onDistanceChange(newValueNumber);
      }
    }
  };

  const isColorBlindMode = useStore((state) => state.isColorBlindMode);
  const isNightMode = useStore((state) => state.isNightMode);

  return (
    <div className={`distance_selector_container ${isColorBlindMode ? 'color-blind-mode' : ''} ${isNightMode ? 'night-mode' : ''}`}>
      <InputGroup className="number_selector_input_group">
        <InputGroup.Text>miles</InputGroup.Text>
        <FormControl
          id="distance_input"
          type="number"
          value={distance !== null && distance !== undefined ? distance : ''} // Handle null and undefined
          onChange={handleChange}
          className="distance_selector_input"
        />
      </InputGroup>
    </div>
  );
};

export default DistanceSelector;
