import React from 'react';
import './WeatherPanel.css';

function WeatherPanel({ weather }) {
  if (!weather) return null;

  const { current, location } = weather;
  const { temp_f, condition } = current;
  const epa_index = current.air_quality['us-epa-index'];
  const iconUrl = `https:${condition.icon}`;
  const wind_direction = current.wind_dir;

  return (
    <div className='weather_panel'>
      <div className='weather_icon'>
        <img src={iconUrl} alt={epa_index}></img>
      </div>
      <div className='temperature'>
        {temp_f}°F
      </div>
      
      <div className='description'>
        US EPA Index: {epa_index}
      </div>
      <div className='wind'>
        Wind speed: {current.wind_mph} m/ph <br />
        Condition: {condition.text}
      </div>
    </div>
  );
}

export default WeatherPanel;
