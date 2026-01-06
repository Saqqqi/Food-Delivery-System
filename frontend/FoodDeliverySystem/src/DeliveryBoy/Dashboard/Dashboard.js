import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OrderMap from './OrderMap'; // Import the OrderMap component
import './Dashboard.css'; // Import the CSS file

const DeliveryBoyDashboard = () => {
    const [user, setUser] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        todayDeliveries: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        completedOrders: 0,
        bonusPoints: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState({}); // Track which orders have map view open
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('deliveryBoyToken');
        const userData = localStorage.getItem('deliveryBoyUser');
        
        if (!token || !userData) {
            navigate('/delivery/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAvailable(parsedUser.isAvailable);
        
        // Fetch delivery boy data and orders
        fetchDashboardData();
    }, [navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('deliveryBoyToken');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            // Fetch assigned orders
            const ordersResponse = await axios.get('http://localhost:3005/api/delivery/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Orders API Response:', ordersResponse.data);
            
            // Log detailed structure of the first order if available
            if (ordersResponse.data && ordersResponse.data.length > 0) {
                console.log('First order structure:', JSON.stringify(ordersResponse.data[0], null, 2));
                console.log('Items structure:', JSON.stringify(ordersResponse.data[0].items, null, 2));
                console.log('Delivery address structure:', JSON.stringify(ordersResponse.data[0].deliveryAddress, null, 2));
                console.log('Restaurant address structure:', JSON.stringify(ordersResponse.data[0].restaurantAddress, null, 2));
            }
            
            // Process and normalize order data to ensure all required fields exist
            const processedOrders = (ordersResponse.data || []).map(order => {
                // Extract address components if available
                let street = '', city = '', phone = '';
                if (order.deliveryAddress) {
                    if (order.deliveryAddress.address) {
                        const addressParts = order.deliveryAddress.address.split(' ');
                        // Try to extract city from the last part of the address
                        if (addressParts.length > 2) {
                            city = addressParts[addressParts.length - 1];
                            street = addressParts.slice(0, -1).join(' ');
                        } else {
                            street = order.deliveryAddress.address;
                        }
                    }
                    // Use phone from deliveryAddress if available
                    phone = order.deliveryAddress.phone || '';
                }

                // Process items to ensure they have names
                const processedItems = Array.isArray(order.items) ? order.items.map(item => ({
                    ...item,
                    name: item.name || (item.product && item.product.name) || `Item (${item.price})`
                })) : [];

                return {
                    ...order,
                    email: order.email || order.userId || 'Unknown',
                    deliveryAddress: {
                        ...order.deliveryAddress,
                        street,
                        city,
                        phone
                    },
                    items: processedItems,
                    totalAmount: order.totalAmount || 0,
                    paymentMethod: order.paymentMethod || 'Unknown',
                    orderDate: order.orderDate || new Date().toISOString()
                };
            });
            
            setOrders(processedOrders);
            
            // Fetch delivery statistics
            const statsResponse = await axios.get('http://localhost:3005/api/delivery/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // If stats endpoint is implemented, use the response data
            // Otherwise, use default stats or calculate from orders
            if (statsResponse.data) {
                setStats(statsResponse.data);
                
                // Update user's bonus points in localStorage
                const userData = JSON.parse(localStorage.getItem('deliveryBoyUser'));
                if (userData && statsResponse.data.bonusPoints !== undefined) {
                    userData.bonusPoints = statsResponse.data.bonusPoints;
                    localStorage.setItem('deliveryBoyUser', JSON.stringify(userData));
                }
            } else {
                // Calculate basic stats from orders if API doesn't provide them
                const completedOrders = localStorage.getItem('completedOrders') ? 
                    parseInt(localStorage.getItem('completedOrders')) : 0;
                
                setStats({
                    todayDeliveries: 0, // This would come from the API
                    pendingOrders: ordersResponse.data.length,
                    completedOrders: completedOrders
                });
            }
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
            // Use empty data if API fails
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async () => {
        const newStatus = !isAvailable;
        setIsAvailable(newStatus);
        
        // Update availability in backend
        try {
            const token = localStorage.getItem('deliveryBoyToken');
            const response = await fetch('http://localhost:3005/api/delivery/availability', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isAvailable: newStatus })
            });
            
            if (response.ok) {
                console.log('Availability updated successfully');
                // Refresh dashboard data after changing availability
                fetchDashboardData();
            } else {
                const errorData = await response.json();
                alert(`Failed to update availability: ${errorData.message || 'Unknown error'}`);
                // Revert the UI state if the API call failed
                setIsAvailable(!newStatus);
            }
        } catch (error) {
            console.error('Error updating availability:', error);
            alert('Error updating availability. Please try again.');
            // Revert the UI state if the API call failed
            setIsAvailable(!newStatus);
        }
    };

    const acceptOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('deliveryBoyToken');
            const response = await fetch(`http://localhost:3005/api/delivery/orders/${orderId}/accept`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Update order status locally
                setOrders(orders.map(order => 
                    order._id === orderId 
                        ? { ...order, status: 'accepted' }
                        : order
                ));
                alert('Order accepted successfully');
            } else {
                const errorData = await response.json();
                alert(`Failed to accept order: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('Error accepting order. Please try again.');
        }
    };

    const completeOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('deliveryBoyToken');
            setLoading(true);
            
            // Find the order to get its details before removing it
            const completedOrder = orders.find(o => o._id === orderId);
            
            // Optimistically update UI
            setOrders(orders.filter(order => order._id !== orderId));
            
            // Update stats optimistically
            setStats(prev => ({
                ...prev,
                todayDeliveries: prev.todayDeliveries + 1,
                completedOrders: prev.completedOrders + 1
            }));
            
            const response = await axios.put(
                `http://localhost:3005/api/delivery/orders/${orderId}/complete`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.status === 200) {
                // Check if bonus points were awarded in the response
                if (response.data && response.data.bonusPoints !== undefined) {
                    setStats(prev => ({
                        ...prev,
                        bonusPoints: response.data.bonusPoints
                    }));
                    alert('Order marked as delivered successfully! +50 bonus points added!');
                } else {
                    alert('Order marked as delivered successfully');
                }
                
                // Refresh dashboard data to get updated orders and stats
                fetchDashboardData();
            } else {
                throw new Error('Failed to complete order');
            }
        } catch (error) {
            console.error('Error completing order:', error);
            alert(`Error completing order: ${error.response?.data?.message || 'Please try again'}`);
            // Revert UI changes by refreshing data
            fetchDashboardData();
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('deliveryBoyToken');
        localStorage.removeItem('deliveryBoyUser');
        navigate('/delivery/login');
    };

    const toggleMap = (orderId) => {
        setShowMap(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const openGoogleMaps = (order) => {
        // Extract restaurant and delivery addresses
        const restaurantAddress = order.restaurantAddress || {};
        const deliveryAddress = order.deliveryAddress || {};
        
        // Construct Google Maps URL
        const origin = encodeURIComponent(
            `${restaurantAddress.restaurantName || 'Restaurant'}, ${restaurantAddress.address || 'Unknown Address'}`
        );
        const destination = encodeURIComponent(
            `${deliveryAddress.address || 'Delivery Address'}`
        );
        
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        window.open(googleMapsUrl, '_blank');
    };

    const navigateToOrderHistory = () => {
        navigate('/delivery/order-history');
    };

    // Function to calculate average delivery time
    const calculateAverageDeliveryTime = () => {
        if (orders.length === 0) return '0 mins';
        
        const totalDeliveryTime = orders.reduce((total, order) => {
            const orderDate = new Date(order.orderDate);
            const deliveredDate = new Date(order.updatedAt);
            return total + (deliveredDate - orderDate);
        }, 0);
        
        const averageMs = totalDeliveryTime / orders.length;
        const minutes = Math.floor(averageMs / (1000 * 60));
        return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="delivery-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="user-info">
                        <h1>Welcome, {user.name}</h1>
                        <p>Delivery Partner</p>
                    </div>
                    <div className="header-actions">
                        <div className="availability-toggle">
                            <span className={`status ${isAvailable ? 'online' : 'offline'}`}>
                                {isAvailable ? 'Online' : 'Offline'}
                            </span>
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox" 
                                    checked={isAvailable}
                                    onChange={toggleAvailability}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-content">
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}
                
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.todayDeliveries}</h3>
                            <p>Today's Deliveries</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>Rs. {stats.totalEarnings.toFixed(2)}</h3>
                            <p>Total Earnings</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.pendingOrders}</h3>
                            <p>Pending Orders</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.completedOrders}</h3>
                            <p>Completed Orders</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.bonusPoints}</h3>
                            <p>Bonus Points</p>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="section-title">Assigned Orders</div>
                <div className="orders-section">
                    {loading ? (
                        <div className="loading-message">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                            <p>Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="no-orders">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
                            </svg>
                            <h3>No orders assigned</h3>
                            <p>No orders have been assigned to you at the moment.</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <h3>Order #{order._id.substring(order._id.length - 6)}</h3>
                                        <span className={`order-status ${order.status}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    
                                    <div className="order-details">
                                        <div className="customer-info">
                                            <h4>Customer Details</h4>
                                            <p><strong>{order.email || 'Unknown'}</strong></p>
                                            <p>
                                                {order.deliveryAddress?.street || 'No address'} 
                                                {order.deliveryAddress?.city ? `, ${order.deliveryAddress.city}` : ''}
                                            </p>
                                            <p>{order.deliveryAddress?.phone || 'No phone number'}</p>
                                        </div>
                                        
                                        <div className="order-info">
                                            <h4>Order Details</h4>
                                            <p><strong>Rs. {order.totalAmount}</strong></p>
                                            <p>Payment: {order.paymentMethod}</p>
                                            <p>Placed: {new Date(order.orderDate).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="order-items-container">
                                        <h4>Items ({order.items?.length || 0})</h4>
                                        {order.items && order.items.length > 0 ? (
                                            <ul>
                                                {order.items.map((item, idx) => (
                                                    <li key={idx}>
                                                        <span>{item.name || `Item ${idx+1}`}</span>
                                                        <span>Qty: {item.quantity || 1} - Rs. {(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No items</p>
                                        )}
                                    </div>
                                    
                                    {/* Map Section */}
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => toggleMap(order._id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                                            </svg>
                                            {showMap[order._id] ? 'Hide Map' : 'Show Delivery Route'}
                                        </button>
                                        
                                        {showMap[order._id] && (
                                            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-lg font-medium text-gray-800">Delivery Route</h4>
                                                    <button 
                                                        onClick={() => openGoogleMaps(order)}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                        </svg>
                                                        Open in Google Maps
                                                    </button>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg p-4 shadow">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="border-l-4 border-red-500 pl-3">
                                                            <h5 className="font-medium text-gray-700">Restaurant</h5>
                                                            <p className="text-sm text-gray-600 font-medium">
                                                                {order.restaurantAddress?.restaurantName || 'Unknown Restaurant'}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {order.restaurantAddress?.address || 'Unknown Address'}
                                                            </p>
                                                            {order.restaurantAddress?.latitude && order.restaurantAddress?.longitude && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Coordinates: {order.restaurantAddress.latitude.toFixed(6)}, {order.restaurantAddress.longitude.toFixed(6)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="border-l-4 border-blue-500 pl-3">
                                                            <h5 className="font-medium text-gray-700">Delivery Address</h5>
                                                            <p className="text-sm text-gray-600 font-medium">
                                                                {order.deliveryAddress?.address || 'Unknown Address'}
                                                            </p>
                                                            {order.deliveryAddress?.latitude && order.deliveryAddress?.longitude && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Coordinates: {order.deliveryAddress.latitude.toFixed(6)}, {order.deliveryAddress.longitude.toFixed(6)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Actual Map Component */}
                                                    <OrderMap order={order} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {order.status === 'shipped' && (
                                        <div className="order-actions">
                                            <button 
                                                onClick={() => completeOrder(order._id)}
                                                className="complete-btn"
                                                disabled={loading}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                                Mark as Delivered
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DeliveryBoyDashboard;