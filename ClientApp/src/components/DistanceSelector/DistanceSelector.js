import React, {useState} from 'react';
import {InputGroup, FormControl } from 'react-bootstrap'

const DistanceSelector = () => {
    const [value, setValue] = useState(0);

    const handleChange = (e) => {
      // Validation for non-negative distance
      const newValue = Number(e.target.value);
      if (newValue >= 0) {
        setValue(newValue);
      } else {
        setValue(0);
      }
    };
  

    return (
        <div className="distance_selector_container">
      <label className="distance_selector_label" htmlFor="distance_input">Distance:</label>
      <InputGroup className="number_selector_input_group">
      <InputGroup.Text>miles</InputGroup.Text>
        <FormControl
          id="distance_input"
          type="number"
          value={value}
          onChange={handleChange}
          className="distance_selector_input"
        />
      </InputGroup>
    </div>
    );
};

export default DistanceSelector;