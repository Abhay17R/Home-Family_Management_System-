import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/Dashboard/Shopping.css';
import API from '../../api/axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faCalendarAlt, faReceipt, faRupeeSign, faTrashAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

// Helper Functions (No changes)
const getStatusClass = (status) => `order-status status-${status ? status.toLowerCase() : 'default'}`;
const getStoreIcon = (storeName) => {
    if (!storeName) return 'fas fa-store';
    const lowerCaseStore = storeName.toLowerCase();
    if (lowerCaseStore.includes('amazon')) return 'fab fa-amazon';
    if (lowerCaseStore.includes('myntra')) return 'fas fa-tshirt';
    if (lowerCaseStore.includes('bigbasket')) return 'fas fa-shopping-basket';
    if (lowerCaseStore.includes('zomato')) return 'fas fa-utensils';
    return 'fas fa-store';
};

// Static Data for Shopping Websites (No changes)
const shoppingWebsitesData = [
    { id: 1, name: 'Amazon India', url: 'https://www.amazon.in', emoji: '🛒', description: 'Electronics, clothing, groceries, books – almost everything.', feature: 'Fast delivery (especially with Prime).' },
    { id: 2, name: 'Flipkart', url: 'https://www.flipkart.com', emoji: '🛍️', description: 'Indian origin, very popular for mobiles, electronics, and fashion.', feature: 'Regular sales (Big Billion Days etc.)' },
    { id: 3, name: 'Myntra', url: 'https://www.myntra.com', emoji: '👗', description: 'Focused on fashion and lifestyle.', feature: 'Top brands, great offers, seasonal sales.' },
    { id: 4, name: 'Ajio', url: 'https://www.ajio.com', emoji: '🧥', description: 'Owned by Reliance. Modern, trendy clothes and accessories.', feature: 'Modern, trendy clothes and accessories.' },
    { id: 5, name: 'Tata CLiQ', url: 'https://www.tatacliq.com', emoji: '🏠', description: 'Clothing, electronics, and premium brands.', feature: 'Backed by Tata Group.' },
    { id: 6, name: 'Nykaa', url: 'https://www.nykaa.com', emoji: '💄', description: 'Best for beauty, skincare, makeup, and cosmetics.', feature: 'Now also sells fashion through Nykaa Fashion.' }
];

const ShoppingAndOrders = () => {
    // State Management
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentOrder, setCurrentOrder] = useState({
        _id: null, store: '', orderId: '', orderDate: '', totalAmount: '', status: 'Pending', websiteUrl: ''
    });

    // API Functions
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await API.get(`orders?search=${searchTerm}`, { withCredentials: true });
            setOrders(response.data.orders);
            setError(null);
        } catch (err) {
            setError("Could not fetch orders. Please try logging in again."); // English Message
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => { fetchOrders(); }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSaveOrder = async (e) => {
        e.preventDefault();
        const orderData = { ...currentOrder };
        delete orderData._id;

        const action = modalMode === 'add' ? 'add' : 'update';
        try {
            if (modalMode === 'add') {
                await API.post('orders', orderData, { withCredentials: true });
            } else {
                await API.put(`orders/${currentOrder._id}`, orderData, { withCredentials: true });
            }
            closeModal();
            fetchOrders();
        } catch (err) {
            alert(`There was a problem ${action}ing the order.`); // English Message
        }
    };
    
    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) { // English Message
            try {
                await API.put(`orders/${orderId}`, { status: 'Cancelled' }, { withCredentials: true });
                fetchOrders();
            } catch (err) {
                alert("Failed to cancel the order."); // English Message
            }
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to permanently delete this order? This cannot be undone.")) { // English Message
            try {
                await API.delete(`orders/${orderId}`, { withCredentials: true });
                fetchOrders();
            } catch (err) {
                alert("Failed to delete the order."); // English Message
            }
        }
    };

    // Modal Control Functions
    const openAddModal = () => {
        setModalMode('add');
        setCurrentOrder({ _id: null, store: '', orderId: '', orderDate: '', totalAmount: '', status: 'Pending', websiteUrl: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (order) => {
        setModalMode('edit');
        const formattedDate = new Date(order.orderDate).toISOString().split('T')[0];
        setCurrentOrder({ ...order, orderDate: formattedDate });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentOrder(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <div className="shopping-container">
            {/* Header */}
            <div className="shopping-header">
                <h1>Shopping & Orders</h1>
                <div className="search-bar-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input type="text" className="search-input" placeholder="Search by store, ID, status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className="add-order-btn" onClick={openAddModal}>
                    <FontAwesomeIcon icon={faPlus} /> Add New Order
                </button>
            </div>

            {/* A wrapper for scrollable content */}
            <div className="main-content-area">
                {/* Orders Section */}
                <div className="orders-section">
                    {loading && <div className="loading-state">Loading orders...</div>}
                    {error && <div className="error-state">{error}</div>}
                    {!loading && !error && (
                        orders.length > 0 ? (
                            <div className="orders-grid">
                                {orders.map((order) => (
                                    <div key={order._id} className="order-card">
                                        <div className="order-card-header">
                                            <div className="store-title-container"><h3>{order.store}</h3></div>
                                            <span className={getStatusClass(order.status)}><span className="status-dot"></span> {order.status}</span>
                                        </div>
                                        <div className="order-card-body">
                                            <div className="order-detail"><FontAwesomeIcon icon={faCalendarAlt} /><span>Date: <strong>{new Date(order.orderDate).toLocaleDateString()}</strong></span></div>
                                            <div className="order-detail"><FontAwesomeIcon icon={faReceipt} /><span>Order ID: <strong>{order.orderId}</strong></span></div>
                                            <div className="order-detail"><FontAwesomeIcon icon={faRupeeSign} /><span>Total: <strong>₹ {order.totalAmount.toFixed(2)}</strong></span></div>
                                        </div>
                                        <div className="order-card-footer">
                                            {/* Correct Button Logic */}
                                            {(order.status === 'Pending' || order.status === 'Shipped') && (
                                                <button className="action-btn icon-btn" title="Edit Order" onClick={() => openEditModal(order)}><FontAwesomeIcon icon={faPencilAlt} /></button>
                                            )}
                                            {order.status === 'Pending' && (
                                                <button className="action-btn danger" onClick={() => handleCancelOrder(order._id)}>Cancel</button>
                                            )}
                                            {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                                                <button className="action-btn icon-btn delete-btn" title="Delete Order" onClick={() => handleDeleteOrder(order._id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<div className="no-results"><h3>No Orders Found</h3><p>Your search for "{searchTerm}" did not match any orders.</p></div>)
                    )}
                </div>

                {/* Popular Websites Section */}
                <div className="shopping-websites-section">
                    <h2>Popular Shopping Websites</h2>
                    <div className="websites-grid">
                        {shoppingWebsitesData.map((site) => (
                            <div key={site.id} className="website-card">
                                <a href={site.url} target="_blank" rel="noopener noreferrer" className="website-card-link" title={`Visit ${site.name}`}>
                                    <div className="website-card-header"><span className="website-emoji" aria-hidden="true">{site.emoji}</span><h3>{site.name}</h3></div>
                                    <p className="website-url">{site.url.replace('https://www.', '')}</p>
                                </a>
                                <div className="website-card-body"><p className="website-description">{site.description}</p><p className="website-feature">{site.feature}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{modalMode === 'add' ? 'Add a New Order' : 'Edit Order'}</h2>
                        <form onSubmit={handleSaveOrder}>
                            <input name="store" value={currentOrder.store} onChange={handleInputChange} placeholder="Store Name" required />
                            <input name="orderId" value={currentOrder.orderId} onChange={handleInputChange} placeholder="Order ID" required />
                            <input name="orderDate" type="date" value={currentOrder.orderDate} onChange={handleInputChange} required />
                            <input name="totalAmount" type="number" step="0.01" value={currentOrder.totalAmount} onChange={handleInputChange} placeholder="Total Amount" required />
                            {modalMode === 'edit' && (
                                <select name="status" value={currentOrder.status} onChange={handleInputChange}>
                                    <option value="Pending">Pending</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
                                </select>
                            )}
                            <input name="websiteUrl" value={currentOrder.websiteUrl} onChange={handleInputChange} placeholder="Website URL (Optional)" />
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal}>Close</button><button type="submit" className="primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingAndOrders;