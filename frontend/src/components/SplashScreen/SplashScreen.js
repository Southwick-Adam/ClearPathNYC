import React, { useEffect } from 'react';
import './SplashScreen.css';
import ClearPathLogo from '../../assets/images/ClearPath_logo.png';

function SplashScreen() {
    useEffect(() => {
        let intro = document.querySelector('.intro');
        let logo = document.querySelector('.logo');

        setTimeout(() => {
            logo.classList.add('active');

            setTimeout(() => {
                    logo.classList.remove('active');
                    logo.classList.add('fade');
                
            }, 2000);

            setTimeout(() => {
                if (intro) intro.style.top = '-100vh';
            }, 2300);

        }, 500);
    }, []);

    return (
        <div className="intro">
            <img className="logo" src={ClearPathLogo} alt="ClearPath Logo" />
        </div>
    );
}

export default SplashScreen;
