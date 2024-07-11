import React from 'react';
import useStore from '../../store/store';
import './NightModeButton.css'

function NightModeButton(){
    const { isNightMode, toggleNightMode } = useStore();

    return (
        <div className="night_button_container">
          <button onClick={toggleNightMode} className="toggle_night_mode">
            {isNightMode ? '☀️' : '🌙 '}
          </button>
        </div>
      );
};

export default NightModeButton;