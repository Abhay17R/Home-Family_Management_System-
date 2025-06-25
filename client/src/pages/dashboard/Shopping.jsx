import React, { useState } from 'react';
import '../../styles/Dashboard/Shopping.css'; // Aapka CSS path

// Dummy data for orders (no changes here)
const dummyOrders = [
    { id: 1, store: 'Amazon Order', websiteUrl: 'https://www.amazon.in', orderId: '#123-4567890', date: 'Oct 26, 2023', total: '2,499.00', status: 'Delivered' },
    { id: 2, store: 'Myntra Haul', websiteUrl: 'https://www.myntra.com', orderId: '#098-7654321', date: 'Nov 01, 2023', total: '5,150.00', status: 'Shipped' },
    { id: 3, store: 'BigBasket Groceries', websiteUrl: 'https://www.bigbasket.com', orderId: '#BB-554433', date: 'Nov 02, 2023', total: '1,800.00', status: 'Pending' },
    { id: 4, store: 'Zomato Food', websiteUrl: 'https://www.zomato.com', orderId: '#ZM-998877', date: 'Nov 02, 2023', total: '750.00', status: 'Delivered' }
];

// NEW: Data for the shopping websites section
const shoppingWebsitesData = [
    {
        id: 1,
        name: 'Amazon India',
        url: 'https://www.amazon.in',
        emoji: '🛒',
        description: 'Electronics, clothing, groceries, books – almost everything.',
        feature: 'Fast delivery (especially with Prime).'
    },
    {
        id: 2,
        name: 'Flipkart',
        url: 'https://www.flipkart.com',
        emoji: '🛍️',
        description: 'Indian origin, very popular for mobiles, electronics, and fashion.',
        feature: 'Regular sales (Big Billion Days etc.)'
    },
    {
        id: 3,
        name: 'Myntra',
        url: 'https://www.myntra.com',
        emoji: '👗',
        description: 'Focused on fashion and lifestyle.',
        feature: 'Top brands, great offers, seasonal sales.'
    },
    {
        id: 4,
        name: 'Ajio',
        url: 'https://www.ajio.com',
        emoji: '🧥',
        description: 'Owned by Reliance. Modern, trendy clothes and accessories.',
        feature: 'Modern, trendy clothes and accessories.'
    },
    {
        id: 5,
        name: 'Tata CLiQ',
        url: 'https://www.tatacliq.com',
        emoji: '🏠',
        description: 'Clothing, electronics, and premium brands.',
        feature: 'Backed by Tata Group.'
    },
    {
        id: 6,
        name: 'Nykaa',
        url: 'https://www.nykaa.com',
        emoji: '💄',
        description: 'Best for beauty, skincare, makeup, and cosmetics.',
        feature: 'Now also sells fashion through Nykaa Fashion.'
    }
];

// Helper functions (no changes here)
const getStatusClass = (status) => `order-status status-${status.toLowerCase()}`;
const getStoreIcon = (storeName) => {
    const lowerCaseStore = storeName.toLowerCase();
    if (lowerCaseStore.includes('amazon')) return 'fab fa-amazon';
    if (lowerCaseStore.includes('myntra')) return 'fas fa-tshirt';
    if (lowerCaseStore.includes('bigbasket')) return 'fas fa-shopping-basket';
    if (lowerCaseStore.includes('zomato')) return 'fas fa-utensils';
    return 'fas fa-store';
};

const ShoppingAndOrders = () => {
    // State for managing the search term (no changes here)
    const [searchTerm, setSearchTerm] = useState('');

    // Filtering logic (no changes here)
    const filteredOrders = dummyOrders.filter(order => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            order.store.toLowerCase().includes(lowerCaseSearchTerm) ||
            order.orderId.toLowerCase().includes(lowerCaseSearchTerm) ||
            order.status.toLowerCase().includes(lowerCaseSearchTerm)
        );
    });

    return (
        <div className="shopping-container">
            {/* Header (no changes here) */}
            <div className="shopping-header">
                <h1>Shopping & Orders</h1>
                <div className="search-bar-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by store, ID, status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="add-order-btn">
                    <i className="fas fa-plus"></i> Add New Order
                </button>
            </div>

            {/* Orders Grid (no changes here) */}
            {filteredOrders.length > 0 ? (
                <div className="orders-grid">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="store-title-container">
                                    <h3>{order.store}</h3>
                                    {order.websiteUrl && (
                                        <a href={order.websiteUrl} target="_blank" rel="noopener noreferrer" className="store-link" title={`Visit ${order.store}`}>
                                            <i className={getStoreIcon(order.store)}></i>
                                        </a>
                                    )}
                                </div>
                                <span className={getStatusClass(order.status)}>
                                    <span className="status-dot"></span> {order.status}
                                </span>
                            </div>
                            <div className="order-card-body">
                                <div className="order-detail"><i className="fas fa-calendar-alt"></i><span>Date: <strong>{order.date}</strong></span></div>
                                <div className="order-detail"><i className="fas fa-receipt"></i><span>Order ID: <strong>{order.orderId}</strong></span></div>
                                <div className="order-detail"><i className="fas fa-rupee-sign"></i><span>Total: <strong>₹ {order.total}</strong></span></div>
                            </div>
                            <div className="order-card-footer">
                                <button className="action-btn">View Details</button>
                                {order.status === 'Delivered' && <button className="action-btn primary">Reorder</button>}
                                {order.status === 'Shipped' && <button className="action-btn">Track Order</button>}
                                {order.status === 'Pending' && <button className="action-btn danger">Cancel</button>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-results">
                    <h3>No Orders Found</h3>
                    <p>Your search for "{searchTerm}" did not match any orders.</p>
                </div>
            )}

            {/* ===== NEW SECTION STARTS HERE ===== */}
            <div className="shopping-websites-section">
                <h2>Popular Shopping Websites</h2>
                <div className="websites-grid">
                    {shoppingWebsitesData.map((site) => (
                        <div key={site.id} className="website-card">
                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="website-card-link" title={`Visit ${site.name}`}>
                                <div className="website-card-header">
                                    <span className="website-emoji" aria-hidden="true">{site.emoji}</span>
                                    <h3>{site.name}</h3>
                                </div>
                                <p className="website-url">{site.url.replace('https://www.', '')}</p>
                            </a>
                            <div className="website-card-body">
                                <p className="website-description">{site.description}</p>
                                <p className="website-feature">{site.feature}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* ===== NEW SECTION ENDS HERE ===== */}

        </div>
    );
};

export default ShoppingAndOrders;