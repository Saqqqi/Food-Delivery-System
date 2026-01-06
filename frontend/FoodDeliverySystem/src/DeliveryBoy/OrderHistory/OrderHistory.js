import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        
        // Fetch order history
        fetchOrderHistory();
    }, [navigate]);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('deliveryBoyToken');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            // Fetch completed orders
            const ordersResponse = await axios.get('http://localhost:3005/api/delivery/order-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setOrders(ordersResponse.data || []);
        } catch (error) {
            console.error('Error fetching order history:', error);
            setError('Failed to load order history. Please try again.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        navigate('/delivery/dashboard');
    };

    const formatDeliveryTime = (deliveryTime) => {
        if (!deliveryTime) return 'N/A';
        
        const { hours, minutes } = deliveryTime;
        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
    };

    const formatAddress = (addressObj) => {
        if (!addressObj) return 'N/A';
        if (typeof addressObj === 'string') return addressObj;
        return addressObj.address || 'N/A';
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                            <p className="text-gray-800 mt-1">Delivery Partner: {user.name}</p>
                        </div>
                        <button 
                            onClick={handleBackToDashboard}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                        <p>{error}</p>
                    </div>
                )}
                
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Completed Deliveries</h2>
                        <p className="text-gray-600 mt-1">View your delivery history and performance metrics</p>
                    </div>
                    
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                                <p className="mt-3 text-gray-600">Loading order history...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No delivery history</h3>
                                <p className="mt-1 text-gray-500">You haven't completed any deliveries yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {orders.map(order => (
                                    <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="px-5 py-3 bg-green-100">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    Order #{order._id.substring(order._id.length - 6)}
                                                </h3>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Order Details</h4>
                                                    <p className="text-gray-900 font-medium">Rs. {order.totalAmount}</p>
                                                    <p className="text-gray-600">Payment Method: {order.paymentMethod}</p>
                                                    <p className="text-gray-600">
                                                        Order Placed: {new Date(order.orderDate).toLocaleString()}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Delivered: {new Date(order.deliveredAt).toLocaleString()}
                                                    </p>
                                                    <p className="text-gray-600 font-medium">
                                                        Delivery Time: {formatDeliveryTime(order.deliveryTime)}
                                                    </p>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Customer Information</h4>
                                                    <p className="text-gray-900">{order.email || 'Unknown'}</p>
                                                    <p className="text-gray-600 mt-1">
                                                        {formatAddress(order.deliveryAddress)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Items ({order.items?.length || 0})</h4>
                                                {order.items && order.items.length > 0 ? (
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                                <div>
                                                                    <span className="text-gray-700 font-medium">{item.name || `Item ${idx+1}`}</span>
                                                                    <span className="text-gray-600 text-sm ml-2">Qty: {item.quantity || 1}</span>
                                                                </div>
                                                                <span className="text-gray-900">Rs. {(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500">No items</p>
                                                )}
                                            </div>
                                            
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Restaurant Information</h4>
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-gray-900 font-medium">
                                                        {order.restaurantAddress?.restaurantName || 'Unknown Restaurant'}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        {order.restaurantAddress?.address || 'Unknown Address'}
                                                    </p>
                                                    {order.restaurantAddress?.latitude && order.restaurantAddress?.longitude && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Coordinates: {order.restaurantAddress.latitude.toFixed(6)}, {order.restaurantAddress.longitude.toFixed(6)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                                <span>Order ID: {order._id}</span>
                                                <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderHistory;