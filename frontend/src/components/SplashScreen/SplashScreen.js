import React, { useEffect } from 'react';
import './SplashScreen.css';
import ClearPathLogo from '../../assets/images/ClearPath_logo.png';

function SplashScreen() {
    useEffect(() => {
        let intro = document.querySelector('.intro');
        let logo = document.querySelector('.logo');
        let text = document.querySelector('.text');

        setTimeout(() => {
            logo.classList.add('active');

            setTimeout(() => {
                text.classList.add('active');
            }, 500);

            setTimeout(() => {
                logo.classList.remove('active');
                logo.classList.add('fade');

                text.classList.remove('active');
                text.classList.add('fade'); 
                
            }, 2000);

            setTimeout(() => {
                if (intro) intro.style.top = '-100vh';
            }, 2300);

        }, 500);
    }, []);

    return (
        <div className="intro">
            <img className="logo" src={ClearPathLogo} alt="ClearPath Logo" />
            <p className="text">Navigate the city with ease.</p>
        </div>
    );
}

export default SplashScreen;
