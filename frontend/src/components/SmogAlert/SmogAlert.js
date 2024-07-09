import { useEffect, useState } from "react";
import './SmogAlert.css';

function SmogAlert({ epaIndex }) {
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (epaIndex >= 4) {
            setShowAlert(true);
        } else {
            setShowAlert(false);
        }
    }, [epaIndex]);

    if (!showAlert) return null;

    return (
        <div className="smog_alert_banner">
            ALERT - HIGH SMOG READINGS IN THE AREA
        </div>
    );
}

export default SmogAlert;
