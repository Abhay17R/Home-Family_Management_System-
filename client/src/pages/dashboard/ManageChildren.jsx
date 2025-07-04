import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import React, { useState } from 'react';
import '../../styles/Dashboard/ManageChildren.css';
import { useAuth } from "../../hooks/useAuth"; // Is CSS file ko hum abhi banayenge
import API from '../../api/axios'

// --- DUMMY DATA ---
// Jab aap backend se connect karenge, toh yeh data API se aayega.
const initialChildrenData = [];
   
// Chhote SVG Icons
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const RemoveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


const ManageChildren = () => {
    const [children, setChildren] = useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState('');
      const { fetchLoggedInUser } = useAuth();
    useEffect(()=>{
        const fetchChildren =async()=>{
            try {
                const {data}=await API.get('admin/my-children',
                    {withCredentials:true}
                );
                if(data.success) setChildren(data.children);
            
                
            } catch (err) {
                setError('Failed to load child profiles.');
                console.error(err);    
            }finally{
                setLoading(false);
            }
        };
        fetchChildren();
    },[]);

    const handleRemoveChild =async (childId) => {
        // Confirmation dialog
        if (window.confirm('Are you sure you want to remove this profile? This action cannot be undone.')) {
            try {
                await API.delete(`admin/child/${childId}`,{
                    withCredentials:true
                });
                setChildren(prevChildren=>prevChildren.filter(child=>child._id!==childId));


            } catch (error) {
                alert('Error:Could not remove the profile.');
            }
        }
    };


   const handlePermissionChange = async (childId, field, value) => {
  try {
    const targetChild = children.find(child => child._id === childId);
    if (!targetChild) return;

    const updatedPermissions = {
      ...targetChild.permissions,
      [field]: value
    };

    await API.put(
      `admin/child/${childId}`,
      { permissions: updatedPermissions }, // ✅ Send full object
      { withCredentials: true }
    );

    setChildren(prev =>
      prev.map(child =>
        child._id === childId
          ? { ...child, permissions: updatedPermissions }
          : child
      )
    );

    // await fetchLoggedInUser();
  } catch (error) {
    alert('Failed to update permission.');
  }
};



    if (loading) {
        return <div className="loading-message">Loading profiles, please wait...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

  
    return (
        <div className="manage-children-container">
            <div className="page-header">
                <div>
                    <h2>Manage Member Profiles</h2>
                    <p>View, edit, or remove member profiles from your family dashboard.</p>
                </div>
                <Link to="/dashboard/add-member" className="btn btn-primary add-child-btn">
                    <AddIcon />
                    <span>Add New Member</span>
                </Link>
            </div>

            <div className="children-grid">
                {children.map((child) => (
                    // ✅ FIX: key ko child._id kiya
                    <div className="child-card" key={child._id}>
                        <div className="card-header">
                            {/* ✅ FIX: Profile pic ke liye fallback use kiya */}
                            <img src={child.profilePic?.url || `https://api.dicebear.com/8.x/initials/svg?seed=${child.name}`} alt={`${child.name}'s profile`} className="profile-pic" />
                            <div className="name-details">
                                {/* ✅ FIX: 'name' field use kiya */}
                                <h3 className="child-name">{child.name}</h3>
                                <span className="child-username">@{child.email.split('@')[0]}</span>
                            </div>
                        </div>

                        <div className="card-body">
                            <h4>Permissions</h4>
                            <div className="permission-item">
                                <span>Location Tracking</span>
                                <label className="switch">
                                    {/* ✅ FIX: `checked` use kiya, optional chaining lagayi aur onChange event joda */}
                                    <input
                                        type="checkbox"
                                        checked={child.permissions?.locationTracking || false}
                                        onChange={(e) => handlePermissionChange(child._id, 'locationTracking', e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <div className="permission-item">
                                <span>Emergency Alerts</span>
                                <label className="switch">
                                    {/* ✅ FIX: `checked` use kiya, optional chaining lagayi aur onChange event joda */}
                                    <input
                                        type="checkbox"
                                        checked={child.permissions?.emergencyAlerts || false}
                                        onChange={(e) => handlePermissionChange(child._id, 'emergencyAlerts', e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="card-actions">
                            <button className="btn-edit">
                                <EditIcon />
                                <span>Edit</span>
                            </button>
                            {/* ✅ FIX: child._id pass kiya */}
                            <button className="btn-remove" onClick={() => handleRemoveChild(child._id)}>
                                <RemoveIcon />
                                <span>Remove</span>
                            </button>
                        </div>

                        
                    </div>
                ))}
            </div>
            
            {children.length === 0 && !loading && (
                <div className="no-children-found">
                    <h3>No memeber profiles found.</h3>
                    <p>Click on "Add New Memeber" to create a new profile.</p>
                </div>
            )}
        </div>
    );
};

export default ManageChildren;