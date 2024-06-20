import React, { useEffect, useState} from 'react';
import './WeatherPanel.css';
import sun from '../../assets/images/sun.png';

// Temporary icon map for weather display
const weatherIconMap ={
    sunny: sun
};

function WeatherPanel(){
    const [weatherData, setWeatherData] = useState(null)

    useEffect(() =>{
        // Simulate a response from backend for now
        setTimeout(() =>{
            const simulatedResponse ={
                temperature:27,
                weatherDescription:'sunny'
                
            };
            setWeatherData(simulatedResponse);
        }, 1000) // simulated 1 second delay for data fetching
    },[]); // Ensure this only runs once after first rendering

    if (!weatherData) return null;

    const {temperature, weatherDescription} = weatherData;
    const icon = weatherIconMap[weatherDescription];

    return (
        <div className='weather_panel'>
            <div className='weather_icon'>
                <img src={icon} alt={weatherDescription}></img>
            </div>
            <div className='temperature'>
                {temperature}°C
            </div>
        </div>
    );
    
};

export default WeatherPanel;