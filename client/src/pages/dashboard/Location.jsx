// Full, updated, and final code for Location.jsx

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import API from '../../api/axios';
import '../../styles/Dashboard/location.css';

// ... (Leaflet Icon Fix and ChangeView component waise hi rahenge) ...
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Offline';
    try {
        return `${formatDistanceToNow(new Date(dateString))} ago`;
    } catch (error) { return 'Invalid date'; }
};

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { animate: true, duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
};

// --- MAIN COMPONENT ---
const LocationDashboard = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]);
    const [currentUser, setCurrentUser] = useState(null);
    const [locationStatus, setLocationStatus] = useState({ status: 'idle', message: '' });
    
    // --- NAYI STATE: Selected member ki poori details store karne ke liye ---
    const [selectedMember, setSelectedMember] = useState(null); 
    
    const [togglingMemberId, setTogglingMemberId] = useState(null);
    const locationIntervalRef = useRef(null);

    // ... (Saare useEffects waise hi rahenge) ...
    // Effect 1: Fetch Current User
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const { data } = await API.get('/me');
                setCurrentUser(data.user);
            } catch (err) { console.error('Failed to fetch current user', err); }
        };
        fetchCurrentUser();
    }, []);

    // Effect 2: Fetch Family Members
    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                const { data } = await API.get('/location/family');
                setFamilyMembers(data.members);
            } catch (err) { console.error("Failed to fetch family members:", err); }
        };
        fetchFamilyMembers();
        const familyInterval = setInterval(fetchFamilyMembers, 10000);
        return () => clearInterval(familyInterval);
    }, []);
    
    // Effect 3: Live Location Update
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus({ status: 'error', message: 'Geolocation is not supported.' });
            return;
        }
        const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        const updateUserLocation = async (position) => {
            setLocationStatus({ status: 'success', message: '' }); 
            try {
                await API.post('/location/update', { lat: position.coords.latitude, lng: position.coords.longitude });
            } catch (err) { /* ... error handling ... */ }
        };
        const handleLocationError = (err) => {
            setLocationStatus({ status: 'error', message: `Location permission denied.` });
        };
        setLocationStatus({ status: 'pending', message: 'Fetching location...' });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateUserLocation(position);
                locationIntervalRef.current = setInterval(() => {
                    navigator.geolocation.getCurrentPosition(updateUserLocation, handleLocationError, geoOptions);
                }, 15000);
            },
            handleLocationError, geoOptions
        );
        return () => { if (locationIntervalRef.current) clearInterval(locationIntervalRef.current); };
    }, []);


    // ... (handlePrivacyToggle waisa hi rahega) ...
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
    
    // --- UPDATE: focusOnMember ab 'selectedMember' state ko set karega ---
    const focusOnMember = (member) => {
        setSelectedMember(member); // Poora member object state me daalo
        if (member.isSharing && member.location?.lat) {
            setMapCenter([member.location.lat, member.location.lng]);
        }
    };

    return (
        <div className="location-dashboard">
            <h1 className="dashboard-title">Family Members' Live Location</h1>
            {locationStatus.status !== 'success' && <p className="info-message">{locationStatus.message}</p>}
            
            <div className="dashboard-content">
                <div className="member-list-container">
                    <h2 className="list-title">Family Members</h2>
                    <ul className="member-list">
                        {familyMembers.map((member) => (
                            <li key={member._id} className={`member-item ${selectedMember?._id === member._id ? 'selected' : ''}`}>
                                <div className="member-info" onClick={() => focusOnMember(member)}>
                                    {/* ... JSX for avatar and details ... */}
                                    <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                                    <div className="member-details">
                                        <span className="member-name">{member.name} {member._id === currentUser?._id && '(You)'}</span>
                                        <span className={`member-status ${member.isSharing && member.location?.lat ? 'online' : 'offline'}`}>
                                            {member.isSharing && member.location?.lat ? formatLastUpdated(member.lastUpdated) : 'Location sharing off'}
                                        </span>
                                    </div>
                                </div>
                                {/* ... JSX for privacy toggle ... */}
                                <div className="privacy-toggle">
                                    {currentUser && member._id === currentUser._id && (
                                        <label className="switch">
                                            <input type="checkbox" checked={member.isSharing} onChange={() => handlePrivacyToggle(member._id, member.isSharing)} disabled={togglingMemberId === member._id} />
                                            <span className="slider round"></span>
                                        </label>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* ======================================================= */}
                    {/* ===== JSX ME NAYA DETAILS PANEL ===== */}
                    {/* ======================================================= */}
                    {selectedMember && (
                        <div className="member-details-panel">
                            <h3>{selectedMember.name}'s Details</h3>
                            <div className="details-grid">
                                <p><strong>Status:</strong></p>
                                <p>{selectedMember.isSharing ? 'Sharing Location' : 'Sharing Off'}</p>
                                
                                <p><strong>Latitude:</strong></p>
                                <p>{selectedMember.isSharing && selectedMember.location?.lat ? selectedMember.location.lat.toFixed(4) : 'N/A'}</p>
                                
                                <p><strong>Longitude:</strong></p>
                                <p>{selectedMember.isSharing && selectedMember.location?.lng ? selectedMember.location.lng.toFixed(4) : 'N/A'}</p>
                                
                                <p><strong>Last Update:</strong></p>
                                <p>{selectedMember.isSharing && selectedMember.location?.lat ? formatLastUpdated(selectedMember.lastUpdated) : 'N/A'}</p>
                            </div>
                        </div>
                    )}
                    {/* ======================================================= */}

                </div>
                <div className="map-container-wrapper">
                    <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} className="map-view">
                        <ChangeView center={mapCenter} zoom={13} />
                        <TileLayer attribution='...' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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