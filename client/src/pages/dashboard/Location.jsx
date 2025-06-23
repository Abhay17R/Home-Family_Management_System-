import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../../styles/Dashboard/location.css';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- Mock Data (Ise aap API se fetch karenge) ---
const initialFamilyMembers = [
    {
        id: 1,
        name: 'Papa',
        avatar: 'P',
        location: { lat: 28.6139, lng: 77.2090 }, // Delhi
        lastUpdated: '5 minutes ago',
        isSharing: true,
    },
    {
        id: 2,
        name: 'Aisha',
        avatar: 'A',
        location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
        lastUpdated: '1 hour ago',
        isSharing: true,
    },
    {
        id: 3,
        name: 'Rohan',
        avatar: 'R',
        location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
        lastUpdated: 'Offline',
        isSharing: false,
    },
];

const LocationDashboard = () => {
    const [familyMembers, setFamilyMembers] = useState(initialFamilyMembers);
    const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]); // Default center (Kolkata)

    // API Call: Privacy toggle per member
    const handlePrivacyToggle = (memberId) => {
        // In a real app, you would send a request to your API endpoint here.
        // For example: await api.post(`/location/privacy/${memberId}`, { isSharing: newStatus });
        
        setFamilyMembers(
            familyMembers.map((member) =>
                member.id === memberId ? { ...member, isSharing: !member.isSharing } : member
            )
        );
    };
    
    // Function to view a member on the map
    const focusOnMember = (member) => {
        if (member.isSharing) {
            setMapCenter([member.location.lat, member.location.lng]);
        }
    }

    return (
        <div className="location-dashboard">
            <h1 className="dashboard-title">Family Members' Live Location</h1>
            <div className="dashboard-content">
                <div className="member-list-container">
                    <h2 className="list-title">Family Members</h2>
                    <ul className="member-list">
                        {familyMembers.map((member) => (
                            <li key={member.id} className="member-item">
                                <div className="member-info" onClick={() => focusOnMember(member)}>
                                    <div className="member-avatar">{member.avatar}</div>
                                    <div className="member-details">
                                        <span className="member-name">{member.name}</span>
                                        <span className={`member-status ${member.isSharing ? 'online' : 'offline'}`}>
                                            {member.isSharing ? `Last updated: ${member.lastUpdated}` : 'Location sharing off'}
                                        </span>
                                    </div>
                                </div>
                                <div className="privacy-toggle">
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={member.isSharing}
                                            onChange={() => handlePrivacyToggle(member.id)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="map-container-wrapper">
                    {/* API Call: Get family members' live location (rendered via markers) */}
                    <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} className="map-view">
                        <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {familyMembers
                            .filter((member) => member.isSharing)
                            .map((member) => (
                                <Marker key={member.id} position={[member.location.lat, member.location.lng]}>
                                    <Popup>
                                        <b>{member.name}</b><br />
                                        Last seen: {member.lastUpdated}
                                    </Popup>
                                </Marker>
                            ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default LocationDashboard;