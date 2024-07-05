import React, { useEffect, useState } from 'react';
import './WeatherPanel.css';

function WeatherPanel() {
    const [weatherData, setWeatherData] = useState(null);

    useEffect(() => {
        // Simulate a response from backend for now
        setTimeout(() => {
            const simulatedResponse = {
                "location": {
                    "name": "New York",
                    "region": "New York",
                    "country": "USA",
                    "lat": 40.76,
                    "lon": -73.99,
                    "tz_id": "America/New_York",
                    "localtime_epoch": 1720181728,
                    "localtime": "2024-07-05 8:15"
                },
                "current": {
                    "last_updated_epoch": 1720181700,
                    "last_updated": "2024-07-05 08:15",
                    "temp_c": 24.4,
                    "temp_f": 75.9,
                    "is_day": 1,
                    "condition": {
                        "text": "Mist",
                        "icon": "//cdn.weatherapi.com/weather/64x64/day/143.png",
                        "code": 1030
                    },
                    "wind_mph": 2.2,
                    "wind_kph": 3.6,
                    "wind_degree": 10,
                    "wind_dir": "N",
                    "pressure_mb": 1011.0,
                    "pressure_in": 29.85,
                    "precip_mm": 0.0,
                    "precip_in": 0.0,
                    "humidity": 91,
                    "cloud": 75,
                    "feelslike_c": 26.8,
                    "feelslike_f": 80.3,
                    "windchill_c": 24.6,
                    "windchill_f": 76.4,
                    "heatindex_c": 27.1,
                    "heatindex_f": 80.9,
                    "dewpoint_c": 22.6,
                    "dewpoint_f": 72.7,
                    "vis_km": 4.0,
                    "vis_miles": 2.0,
                    "uv": 5.0,
                    "gust_mph": 7.9,
                    "gust_kph": 12.7,
                    "air_quality": {
                        "co": 614.2,
                        "no2": 40.8,
                        "o3": 1.3,
                        "so2": 9.9,
                        "pm2_5": 23.2,
                        "pm10": 30.2,
                        "us-epa-index": 2,
                        "gb-defra-index": 2
                    }
                }
            };
            setWeatherData(simulatedResponse);
        }, 1000);
    }, []);

    if (!weatherData) return null;

    const { current, location } = weatherData;
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
                Wind blowing {wind_direction} at {current.wind_mph} mph
                </div>
        </div>
    );
}

export default WeatherPanel;
