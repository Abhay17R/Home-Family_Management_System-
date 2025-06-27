import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns'; // Timestamp formatting ke liye
import API from '../../api/axios'; // Apne custom Axios instance ko import karein
import '../../styles/Dashboard/location.css';

// --- LEAFLET ICON FIX ---
// Ye code Leaflet ke icons ko aane wali build errors se bachata hai.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// ===================================================================
// ===== YEH FUNCTION MISSING THA - AB ADD KAR DIYA GAYA HAI =====
// ===================================================================
// Helper function jo date ko "5 minutes ago" jaise format me badalta hai.
const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Offline';
    try {
        return `${formatDistanceToNow(new Date(dateString))} ago`;
    } catch (error) {
        return 'Invalid date';
    }
};
// ===================================================================


// Helper component jo map ko smoothly animate karta hai.
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, zoom, map]);
    return null;
};


// --- MAIN COMPONENT ---
const LocationDashboard = () => {
    // States
    const [familyMembers, setFamilyMembers] = useState([]);
    const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]); // Default: Kolkata
    const [currentUser, setCurrentUser] = useState(null);
    const [locationStatus, setLocationStatus] = useState({ status: 'idle', message: '' });
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [togglingMemberId, setTogglingMemberId] = useState(null);
    const locationIntervalRef = useRef(null);

    // Effect 1: Logged-in user ka data fetch karna
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const { data } = await API.get('/me');
                setCurrentUser(data.user);
            } catch (err) {
                console.error('Failed to fetch current user', err);
            }
        };
        fetchCurrentUser();
    }, []);

    // Effect 2: Family members ki list fetch karna
    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                const { data } = await API.get('/location/family');
                setFamilyMembers(data.members);
            } catch (err) {
                console.error("Failed to fetch family members:", err);
            }
        };
        fetchFamilyMembers();
        const familyInterval = setInterval(fetchFamilyMembers, 10000);
        return () => clearInterval(familyInterval);
    }, []);
    
    // Effect 3: Apni location ko live update karna (Robust version)
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus({ status: 'error', message: 'Geolocation is not supported by your browser.' });
            return;
        }

        const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        
        const updateUserLocation = async (position) => {
            setLocationStatus({ status: 'success', message: '' });
            try {
                await API.post('/location/update', { lat: position.coords.latitude, lng: position.coords.longitude });
            } catch (err) {
                if (err.response?.status === 401) {
                    setLocationStatus({ status: 'error', message: 'Session expired. Live tracking stopped.' });
                    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
                }
            }
        };

        const handleLocationError = (err) => {
            setLocationStatus({ status: 'error', message: `Location permission denied. Your location will not be updated.` });
        };
        
        setLocationStatus({ status: 'pending', message: 'Fetching your location...' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateUserLocation(position);
                locationIntervalRef.current = setInterval(() => {
                    navigator.geolocation.getCurrentPosition(updateUserLocation, handleLocationError, geoOptions);
                }, 15000);
            },
            handleLocationError,
            geoOptions
        );

        return () => { if (locationIntervalRef.current) clearInterval(locationIntervalRef.current); };
    }, []);

    // Handler for privacy toggle
    const handlePrivacyToggle = async (memberId, currentStatus) => {
        setTogglingMemberId(memberId);
        const newStatus = !currentStatus;
        setFamilyMembers(familyMembers.map((m) => m._id === memberId ? { ...m, isSharing: newStatus } : m));
        try {
            await API.post(`/location/privacy`, { isSharing: newStatus });
        } catch (err) {
            setFamilyMembers(familyMembers.map((m) => m._id === memberId ? { ...m, isSharing: currentStatus } : m));
        } finally {
            setTogglingMemberId(null);
        }
    };
    
    // Handler to focus on a member
    const focusOnMember = (member) => {
        setSelectedMemberId(member._id);
        if (member.isSharing && member.location?.lat) {
            setMapCenter([member.location.lat, member.location.lng]);
        }
    };

    // JSX Rendering
    return (
        <div className="location-dashboard">
            <h1 className="dashboard-title">Family Members' Live Location</h1>
            {locationStatus.status === 'error' && <p className="error-message">{locationStatus.message}</p>}
            {locationStatus.status === 'pending' && <p className="info-message">{locationStatus.message}</p>}
            
            <div className="dashboard-content">
                <div className="member-list-container">
                    <h2 className="list-title">Family Members</h2>
                    <ul className="member-list">
                        {familyMembers.map((member) => (
                            <li key={member._id} className={`member-item ${selectedMemberId === member._id ? 'selected' : ''}`}>
                                <div className="member-info" onClick={() => focusOnMember(member)}>
                                    <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                                    <div className="member-details">
                                        <span className="member-name">{member.name} {member._id === currentUser?._id && '(You)'}</span>
                                        <span className={`member-status ${member.isSharing && member.location?.lat ? 'online' : 'offline'}`}>
                                            {member.isSharing && member.location?.lat ? formatLastUpdated(member.lastUpdated) : 'Location sharing off'}
                                        </span>
                                    </div>
                                </div>
                                <div className="privacy-toggle">
                                    {currentUser && member._id === currentUser._id && (
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={member.isSharing}
                                                onChange={() => handlePrivacyToggle(member._id, member.isSharing)}
                                                disabled={togglingMemberId === member._id}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="map-container-wrapper">
                    <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} className="map-view">
                        <ChangeView center={mapCenter} zoom={13} />
                        <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {familyMembers
                            .filter((member) => member.isSharing && member.location?.lat)
                            .map((member) => (
                                <Marker key={member._id} position={[member.location.lat, member.location.lng]}>
                                    <Popup><b>{member.name}</b><br />Last seen: {formatLastUpdated(member.lastUpdated)}</Popup>
                                </Marker>
                            ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default LocationDashboard;   