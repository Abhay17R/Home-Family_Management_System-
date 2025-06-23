import React, { useState, useRef, useEffect } from 'react';
import '../../styles/Dashboard/emergency.css';

// Simple Alert Icon (from a library like react-icons or custom SVG)
const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

function EmergencyAlertSystem() {
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);

    const holdTimerRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const audioRef = useRef(null);

    // Dummy data for alert history
    const [alertHistory, setAlertHistory] = useState([
        { id: 1, user: 'Priya', date: '2023-10-25 08:15 PM', status: 'Resolved' },
        { id: 2, user: 'Aarav', date: '2023-10-22 11:30 AM', status: 'Resolved' },
    ]);

    // Preload the audio
    useEffect(() => {
        audioRef.current = new Audio('/path/to/siren-alert.mp3'); // IMPORTANT: Replace with your actual sound file path
        audioRef.current.preload = 'auto';
    }, []);

    const playAlertSound = () => {
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(error => console.error("Audio play failed:", error));
        }
    };

    const stopAlertSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const triggerSOS = () => {
        console.log("--- TRIGGERING SOS ---");
        setIsAlertActive(true);
        playAlertSound();

        // --- SIMULATE API CALL TO BACKEND ---
        // In a real app, you would make a fetch/axios call here
        // fetch('/api/emergency/trigger-sos', { method: 'POST', ... });
        console.log("API call to trigger SMS via Twilio would be made here.");

        // Add to history
        const newAlert = {
            id: Date.now(),
            user: 'You',
            date: new Date().toLocaleString(),
            status: 'Active'
        };
        setAlertHistory(prev => [newAlert, ...prev]);
    };

    const handleMouseDown = () => {
        setIsHolding(true);
        setHoldProgress(0);

        // Start the progress interval
        progressIntervalRef.current = setInterval(() => {
            setHoldProgress(prev => prev + 1);
        }, 20); // 100 * 20ms = 2000ms = 2 seconds

        // Set a timer to trigger SOS after 2 seconds
        holdTimerRef.current = setTimeout(() => {
            clearInterval(progressIntervalRef.current);
            triggerSOS();
        }, 2000);
    };

    const cancelHold = () => {
        setIsHolding(false);
        clearTimeout(holdTimerRef.current);
        clearInterval(progressIntervalRef.current);
        setHoldProgress(0);
    };

    const handleMouseUp = () => {
        cancelHold();
    };

    const handleMouseLeave = () => {
        if (isHolding) {
            cancelHold();
        }
    };
    
    const handleCancelAlert = () => {
        setIsAlertActive(false);
        stopAlertSound();
        // Update the status in history
        setAlertHistory(prev => 
            prev.map(alert => alert.status === 'Active' ? { ...alert, status: 'Resolved' } : alert)
        );
        console.log("--- ALERT CANCELLED ---");
        // You might also want to send an "I'm safe" API call here
    };

    if (isAlertActive) {
        return (
            <div className="emergency-container alert-active-bg">
                <div className="alert-active-content">
                    <div className="pulsing-icon">
                        <AlertTriangleIcon />
                    </div>
                    <h1>ALERT ACTIVE</h1>
                    <p>Your emergency contacts have been notified via SMS and your location has been shared.</p>
                    <button className="cancel-alert-button" onClick={handleCancelAlert}>
                        I'm Safe (Cancel Alert)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="emergency-container">
            <div className="emergency-header">
                <h1>Emergency Alert System</h1>
                <p>In case of an emergency, press and hold the SOS button for 2 seconds.</p>
            </div>

            <div className="sos-button-container">
                <button
                    className="sos-button"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleMouseDown} // For mobile
                    onTouchEnd={handleMouseUp}     // For mobile
                    style={{ '--progress': `${holdProgress}%` }}
                >
                    <div className="sos-button-content">
                        <AlertTriangleIcon />
                        <span>SOS</span>
                    </div>
                </button>
                <div className="sos-instructions">
                    {isHolding ? 'Keep Holding...' : 'Press & Hold to Send Alert'}
                </div>
            </div>

            <div className="alert-history-card">
                <h3>Alert History</h3>
                <ul className="alert-history-list">
                    {alertHistory.length > 0 ? alertHistory.map(alert => (
                        <li key={alert.id} className="history-item">
                            <div className="history-details">
                                <span className="history-user">{alert.user} triggered an alert.</span>
                                <span className="history-date">{alert.date}</span>
                            </div>
                            <span className={`history-status status-${alert.status.toLowerCase()}`}>
                                {alert.status}
                            </span>
                        </li>
                    )) : (
                       <li className="no-history">No past alerts found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default EmergencyAlertSystem;