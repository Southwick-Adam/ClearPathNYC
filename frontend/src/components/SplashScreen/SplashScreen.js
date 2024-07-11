import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import ClearPathLogo from '../../assets/images/ClearPath_logo.png';

function SplashScreen({ setPlayVideo }) {
    const [logoActive, setLogoActive] = useState(false);
    const [textActive, setTextActive] = useState(false);
    const [buttonVisible, setButtonVisible] = useState(false);
    const [startClicked, setStartClicked] = useState(false);

    useEffect(() => {
        let intro = document.querySelector('.intro');
        let logo = document.querySelector('.logo');
        let text = document.querySelector('.text');
        let button = document.querySelector('.start-button');

        setTimeout(() => {
            setLogoActive(true);

            setTimeout(() => {
                setTextActive(true);
            }, 500);

            setTimeout(() => {
                setButtonVisible(true);
            }, 1000);

        }, 500);
    }, []);

    useEffect(() => {
        if (!startClicked) return;

        let intro = document.querySelector('.intro');

        setTimeout(() => {
            if (intro) intro.style.top = '-100vh';
            setPlayVideo(true);
        }, 300); // Adjust transition timing if needed
    }, [startClicked, setPlayVideo]);

    const handleStartClick = () => {
        setStartClicked(true);
    };

    return (
        <div className="intro">
            <img className={`logo ${logoActive ? 'active' : ''}`} src={ClearPathLogo} alt="ClearPath Logo" />
            <p className={`text ${textActive ? 'active' : ''}`}>Navigate the city with ease.</p>
            <div className='start_container'>
                <button className={`start-button ${buttonVisible ? 'active' : ''}`} onClick={handleStartClick}>Start</button>
            </div>
            
        </div>
    );
}

export default SplashScreen;
