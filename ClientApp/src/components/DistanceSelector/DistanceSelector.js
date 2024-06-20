import React from 'react';
import {InputGroup, FormControl } from 'react-bootstrap'

const DistanceSelector = ({distance, onDistanceChange}) => {
    const handleChange = (e) => {
      // Validation for non-negative distance
      const newValue = Number(e.target.value);
      if (newValue >= 0) {
        onDistanceChange(newValue);
      } else {
        onDistanceChange(0);
      }
    };
  

  return (
    <div className="distance_selector_container">
      <InputGroup className="number_selector_input_group">
      <InputGroup.Text>miles</InputGroup.Text>
        <FormControl
          id="distance_input"
          type="number"
          value={distance}
          onChange={handleChange}
          className="distance_selector_input"
        />
      </InputGroup>
    </div>
  );
};

export default DistanceSelector;