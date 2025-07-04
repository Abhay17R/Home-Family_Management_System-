import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import API from '../../api/axios';
import '../../styles/Dashboard/emergency.css';
const backendURL = import.meta.env.VITE_BACKEND_URL;

const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

function EmergencyAlertSystem() {
    const [activeAlert, setActiveAlert] = useState(null);
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);
    const [alertHistory, setAlertHistory] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    const holdTimerRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const audioRef = useRef(new Audio('/audio/emergency-siren.mp3'));
    const socketRef = useRef(null);

    useEffect(() => {
        audioRef.current.preload = 'auto';

        const fetchCurrentUser = async () => {
            try {
                const { data } = await API.get('/me');
                setCurrentUser(data.user);
            } catch (err) {
                console.error("Could not fetch user data", err);
                setError("Could not verify your identity. Please refresh.");
            }
        };

        const fetchHistory = async () => {
            try {
                const { data } = await API.get('/emergency/history');
                setAlertHistory(data.alerts);
                const currentlyActive = data.alerts.find(a => a.status === 'Active');
                if (currentlyActive) {
                    setActiveAlert(currentlyActive);
                    playAlertSound();
                }
            } catch (err) {
                setError('Could not load alert history.');
            }
        };

        fetchCurrentUser();
        fetchHistory();
    }, []);

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;

        socketRef.current = io(backendURL, { auth: { token } });

        socketRef.current.on('connect', () => console.log('Socket.IO connection established.'));

        socketRef.current.on('new-alert', (newAlertData) => {
            setAlertHistory(prev => [newAlertData, ...prev]);
            setActiveAlert(newAlertData);
            playAlertSound();
        });

        socketRef.current.on('alert-resolved', ({ alertId }) => {
            setActiveAlert(null);
            stopAlertSound();
            setAlertHistory(prev =>
                prev.map(alert => alert._id === alertId ? { ...alert, status: 'Resolved' } : alert)
            );
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const playAlertSound = () => {
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.play().catch(error => {
                console.error("Audio play failed:", error);
            });
        }
    };

    const stopAlertSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const triggerSOS = async () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setError('');
                try {
                    const { data } = await API.post('/emergency/trigger', {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setActiveAlert(data.alert);  // ✅ Update UI without reload
                    playAlertSound();
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to trigger alert.');
                }
            },
            () => setError('Could not get your location. Please grant permission.'),
            { enableHighAccuracy: true }
        );
    };

    const handleMouseDown = () => {
        if (activeAlert) return;
        setIsHolding(true);
        setHoldProgress(0);
        progressIntervalRef.current = setInterval(() => setHoldProgress(prev => prev + 1), 20);
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

    const handleMouseUp = () => cancelHold();
    const handleMouseLeave = () => { if (isHolding) cancelHold(); };

    const handleCancelAlert = async () => {
        setIsCancelling(true);
        stopAlertSound();
        try {
            await API.post('/emergency/resolve');
            setActiveAlert(null);  // ✅ No reload needed
            setAlertHistory(prev =>
                prev.map(alert =>
                    alert._id === activeAlert._id
                        ? { ...alert, status: 'Resolved' }
                        : alert
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel alert.');
        } finally {
            setIsCancelling(false);
        }
    };

    if (activeAlert) {
        return (
            <div className="emergency-container alert-active-bg">
                <div className="alert-active-content">
                    <div className="pulsing-icon"><AlertTriangleIcon /></div>
                    <h1>ALERT ACTIVE</h1>
                    <p><b>{activeAlert.triggeredBy.name}</b> needs help! Emergency contacts have been notified.</p>

                    {currentUser && activeAlert.triggeredBy._id === currentUser._id && (
                        <button
                            className="cancel-alert-button"
                            onClick={handleCancelAlert}
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'Cancelling...' : "I'm Safe (Cancel Alert)"}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="emergency-container">
            <div className="emergency-header">
                <h1>Emergency Alert System</h1>
                <p>In case of an emergency, press and hold the SOS button for 2 seconds.</p>
                {error && <p className="error-message">{error}</p>}
            </div>

            <div className="sos-button-container">
                <button
                    className="sos-button"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    style={{ '--progress': `${holdProgress}%` }}
                    disabled={!currentUser || !!activeAlert}
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
                        <li key={alert._id} className="history-item">
                            <div className="history-details">
                                <span className="history-user">{alert.triggeredBy.name} triggered an alert.</span>
                                <span className="history-date">{format(new Date(alert.createdAt), 'PPpp')}</span>
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
