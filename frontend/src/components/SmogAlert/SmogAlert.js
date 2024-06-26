import { useEffect, useState } from "react";
import './SmogAlert.css';
function SmogAlert() {
    const [showAlert, setShowAlert] = useState(false);
    useEffect(() => {
        // Add code later for handling smog data returned from backend/ api
        // For now, simulate fetching data and show allert for testing
        setShowAlert(true);
    },[]);// Empty array means this runs only once after the initial
    if (!showAlert) return null;
    return (
        <div className="smog_alert_banner">
            ALERT - HIGH SMOG READINGS IN THE AREA
        </div>
    );
}

export default SmogAlert;