import React, { useState } from 'react';
import LocationFinder from '../LocationFinder/LocationFinder';
import GoButton from '../GoButton/GoButton';
import BusyToggleSwitch from '../BusyToggleSwitch/BusyToggleSwitch';
import './PointToPoint.css';


function PointToPoint(){
    const [startCord, setStartCord] = useState(null);
    const [endCord, setEndCord] = useState(null);
    const [mode, setMode] = useState('quiet');

    const handleToggleChange = (newMode) => {
        setMode(newMode);

    };

    function handleSubmit(event){
        event.preventDefault(); // prevent default form submission processses for smoother user interaction
        const formData = {
            startCord,
            endCord,
            mode,
        };
        console.log('PTP Form submitted: ', formData) // dev log, remove after adding logic to send data to backend
    }
    return(
        <form className='pointtopoint_container' onSubmit={handleSubmit}>
            <div className='ptp_row'>
            <div className='ptp_label'>Start</div>
                <LocationFinder setCoordinates={setStartCord}/>
            </div>
            <div className='ptp_row'>
                <div className='ptp_label'>End</div>
                <LocationFinder setCoordinates={setEndCord}/>
            </div>
            <div className='busy_go_row'>
                <BusyToggleSwitch mode={mode} handleToggleChange={handleToggleChange} /> 
                <GoButton />
            </div>
        </form>
    )
};

export default PointToPoint;