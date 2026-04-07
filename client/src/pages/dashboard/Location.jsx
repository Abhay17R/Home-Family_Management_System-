import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { formatDistanceToNow } from 'date-fns';
import API from '../../api/axios';
import '../../styles/Dashboard/location.css';

const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Offline';
    try {
        return `${formatDistanceToNow(new Date(dateString))} ago`;
    } catch (error) { return 'Invalid date'; }
};

// Google Map Container styling
const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px' // Apne hisaab se adjust kar lena
};

const LocationDashboard = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    // Google Maps lat/lng ko object me accept karta hai array [lat, lng] me nahi
    const [mapCenter, setMapCenter] = useState({ lat: 22.5726, lng: 88.3639 }); 
    const [currentUser, setCurrentUser] = useState(null);
    const [locationStatus, setLocationStatus] = useState({ status: 'idle', message: '' });
    const [selectedMember, setSelectedMember] = useState(null); 
    const [togglingMemberId, setTogglingMemberId] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);

    const locationIntervalRef = useRef(null);

    // --- GOOGLE MAPS API LOADER ---
   const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, 
});

    // Map Load/Unload handlers
    const onLoad = useCallback(function callback(map) {
        setMapInstance(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMapInstance(null);
    }, []);

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
            } catch (err) { console.error(err); }
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
    
    const focusOnMember = (member) => {
        setSelectedMember(member); 
        if (member.isSharing && member.location?.lat && member.location?.lng) {
            const newCenter = { lat: member.location.lat, lng: member.location.lng };
            setMapCenter(newCenter);
            
            // Map ko smoothly nayi location par move karne ke liye
            if (mapInstance) {
                mapInstance.panTo(newCenter);
                mapInstance.setZoom(15); // Focus karne pe thoda zoom in ho jayega
            }
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
                                            <input type="checkbox" checked={member.isSharing} onChange={() => handlePrivacyToggle(member._id, member.isSharing)} disabled={togglingMemberId === member._id} />
                                            <span className="slider round"></span>
                                        </label>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

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
                </div>

                <div className="map-container-wrapper">
                    {/* Map tabhi render hoga jab script load ho jayegi */}
                    {loadError && <div>Error loading maps</div>}
                    {!isLoaded && !loadError && <div>Loading Maps...</div>}
                    {isLoaded && (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={mapCenter}
                            zoom={13}
                            onLoad={onLoad}
                            onUnmount={onUnmount}
                            options={{ disableDefaultUI: false, zoomControl: true }} // Tum inko control kar sakte ho
                        >
                            {/* Active family members ke markers render karo */}
                            {familyMembers
                                .filter((member) => member.isSharing && member.location?.lat && member.location?.lng)
                                .map((member) => (
                                    <MarkerF 
                                        key={member._id} 
                                        position={{ lat: member.location.lat, lng: member.location.lng }}
                                        onClick={() => setSelectedMember(member)} // Marker click pe info window khulegi
                                    >
                                        {/* InfoWindow (Tooltip) sirf tab dikhegi jab member selected ho */}
                                        {selectedMember && selectedMember._id === member._id && (
                                            <InfoWindowF onCloseClick={() => setSelectedMember(null)}>
                                                <div style={{ color: 'black', padding: '5px' }}>
                                                    <b style={{ display: 'block', marginBottom: '5px' }}>{member.name}</b>
                                                    <span>Last seen: {formatLastUpdated(member.lastUpdated)}</span>
                                                </div>
                                            </InfoWindowF>
                                        )}
                                    </MarkerF>
                                ))}
                        </GoogleMap>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationDashboard;