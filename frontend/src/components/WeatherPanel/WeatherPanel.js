import React from 'react';
import './WeatherPanel.css';

function WeatherPanel({ weather }) {
  if (!weather) return null;

  const { current, location } = weather;
  const { temp_f, condition } = current;
  const epa_index = current.air_quality['us-epa-index'];
  const iconUrl = `https:${condition.icon}`;

  const epaImages = {
    0: require('../../assets/images/epa_none.png'),
    1: require('../../assets/images/epa_1.png'),
    2: require('../../assets/images/epa_2.png'),
    3: require('../../assets/images/epa_3.png'),
    4: require('../../assets/images/epa_4.png'),
    5: require('../../assets/images/epa_5.png'),
    6: require('../../assets/images/epa_6.png')
  };

  const epaMessages = {
    1: "Air quality is great!",
    2: "Air quality is acceptable.",
    3: "Air quality may affect sensitive groups.",
    4: "Alert: Air quality is currently unhealthy.",
    5: "Alert: Air quality is currently very unhealthy.",
    6: "Alert: Air quality is hazardous."
  };

  const epaImageUrl = epaImages[epa_index] || epaImages[0];
  const epaMessage = epaMessages[epa_index] || "No information available.";

  const alertPanelClass = epa_index <= 3 ? 'alert_panel blue' : 'alert_panel red';

  return (
    <div>
      <div className='weather_panel'>
        <div className='weather_icon'>
          <img src={iconUrl} alt={condition.text}></img>
        </div>
        <div className='temperature'>
          {temp_f}°F
        </div>
        <div className='wind'>
          {condition.text}
        </div>
      </div>

      <div className={alertPanelClass}>
        <div className='epa_icon'>
          <img src={epaImageUrl} alt={`EPA Index ${epa_index}`}></img>
        </div>
        <div className='message'>
          {epaMessage}
        </div>
      </div>
    </div>
  );
}

export default WeatherPanel;
