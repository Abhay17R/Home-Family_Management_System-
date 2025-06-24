import React, { useState } from 'react'; // useState import karein
import '../../styles/Dashboard/Shopping.css'; // Aapka CSS path

// Dummy data (no changes here)
const dummyOrders = [
    {
        id: 1,
        store: 'Amazon Order',
        websiteUrl: 'https://www.amazon.in',
        orderId: '#123-4567890',
        date: 'Oct 26, 2023',
        total: '2,499.00',
        status: 'Delivered',
    },
    {
        id: 2,
        store: 'Myntra Haul',
        websiteUrl: 'https://www.myntra.com',
        orderId: '#098-7654321',
        date: 'Nov 01, 2023',
        total: '5,150.00',
        status: 'Shipped',
    },
    {
        id: 3,
        store: 'BigBasket Groceries',
        websiteUrl: 'https://www.bigbasket.com',
        orderId: '#BB-554433',
        date: 'Nov 02, 2023',
        total: '1,800.00',
        status: 'Pending',
    },
    {
        id: 4,
        store: 'Zomato Food',
        websiteUrl: 'https://www.zomato.com',
        orderId: '#ZM-998877',
        date: 'Nov 02, 2023',
        total: '750.00',
        status: 'Delivered',
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
    // NEW: State for managing the search term
    const [searchTerm, setSearchTerm] = useState('');

    // NEW: Filtering logic
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
            {/* Header */}
            <div className="shopping-header">
                <h1>Shopping & Orders</h1>
                {/* NEW: Search Bar */}
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

            {/* Orders Grid - Renders filteredOrders instead of dummyOrders */}
            {filteredOrders.length > 0 ? (
                <div className="orders-grid">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="store-title-container">
                                    <h3>{order.store}</h3>
                                    {order.websiteUrl && (
                                        <a 
                                          href={order.websiteUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="store-link"
                                          title={`Visit ${order.store}`}
                                        >
                                            <i className={getStoreIcon(order.store)}></i>
                                        </a>
                                    )}
                                </div>
                                <span className={getStatusClass(order.status)}>
                                    <span className="status-dot"></span> {order.status}
                                </span>
                            </div>
                            <div className="order-card-body">
                                <div className="order-detail">
                                    <i className="fas fa-calendar-alt"></i>
                                    <span>Date: <strong>{order.date}</strong></span>
                                </div>
                                <div className="order-detail">
                                    <i className="fas fa-receipt"></i>
                                    <span>Order ID: <strong>{order.orderId}</strong></span>
                                </div>
                                <div className="order-detail">
                                    <i className="fas fa-rupee-sign"></i>
                                    <span>Total: <strong>₹ {order.total}</strong></span>
                                </div>
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
                // NEW: Message for when no results are found
                <div className="no-results">
                    <h3>No Orders Found</h3>
                    <p>Your search for "{searchTerm}" did not match any orders.</p>
                </div>
            )}
        </div>
    );
};

export default ShoppingAndOrders;