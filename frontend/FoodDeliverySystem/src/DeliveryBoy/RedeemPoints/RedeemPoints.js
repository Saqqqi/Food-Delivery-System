import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const RedeemPoints = () => {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [remainingPoints, setRemainingPoints] = useState(0);
    const [receiptCode, setReceiptCode] = useState('');
    const [restaurantAddresses, setRestaurantAddresses] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const navigate = useNavigate();

    const POINTS_REQUIRED = 150;
    const MAX_ITEMS = 12;

    useEffect(() => {
        const token = localStorage.getItem('deliveryBoyToken');
        const userData = localStorage.getItem('deliveryBoyUser');
        
        if (!token || !userData) {
            navigate('/delivery/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        console.log('User data from localStorage:', parsedUser);
        setUser(parsedUser);
        setRemainingPoints(parsedUser.bonusPoints || 0);
        
        // Fetch fresh user data from API to ensure we have the latest bonus points
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3005/api/delivery/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Fresh user data from API:', response.data);
                
                if (response.data && response.data.bonusPoints !== undefined) {
                    // Update user data in state and localStorage with fresh data
                    const updatedUser = {...parsedUser, bonusPoints: response.data.bonusPoints};
                    localStorage.setItem('deliveryBoyUser', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    setRemainingPoints(response.data.bonusPoints);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        
        fetchUserData();
        
        // Fetch products
        fetchProducts();
        
        // Fetch restaurant addresses
        fetchRestaurantAddresses();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch products from backend
            const token = localStorage.getItem('deliveryBoyToken');
            const response = await axios.get('http://localhost:3005/api/delivery/redemption-products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Limit to MAX_ITEMS products
            const limitedProducts = response.data.slice(0, MAX_ITEMS);
            setProducts(limitedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRestaurantAddresses = async () => {
        try {
            const response = await axios.get('http://localhost:3005/api/restaurant-delivery-addresses');
            setRestaurantAddresses(response.data || []);
        } catch (error) {
            console.error('Error fetching restaurant addresses:', error);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
    };

    const handleClaim = async () => {
        try {
            if (!selectedProduct) {
                alert('Please select a product first');
                return;
            }

            const token = localStorage.getItem('deliveryBoyToken');
            
            // Call API to redeem points
            const response = await axios.post(
                'http://localhost:3005/api/delivery/redeem-points',
                { productId: selectedProduct._id },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Update remaining points
            setRemainingPoints(response.data.remainingPoints);
            
            // Update user in localStorage
            const userData = JSON.parse(localStorage.getItem('deliveryBoyUser'));
            userData.bonusPoints = response.data.remainingPoints;
            localStorage.setItem('deliveryBoyUser', JSON.stringify(userData));
            
            // Generate receipt code
            const generateReceiptCode = () => {
                const timestamp = new Date().getTime().toString().slice(-6);
                const userInitials = userData.name ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'XX';
                const productCode = selectedProduct.name.slice(0, 3).toUpperCase();
                const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                return `${userInitials}${productCode}-${timestamp}-${randomDigits}`;
            };
            
            const code = generateReceiptCode();
            setReceiptCode(code);
            
            // Show receipt
            setShowReceipt(true);
        } catch (error) {
            console.error('Error claiming product:', error);
            alert(`Error: ${error.response?.data?.message || 'Failed to claim product. Please try again.'}`);
        }
    };

    const handleGoToStore = () => {
        // Reset state and hide receipt
        setShowReceipt(false);
        setSelectedProduct(null);
    };

    const handleBackToDashboard = () => {
        navigate('/delivery/dashboard');
    };

    const toggleMap = () => {
        setShowMap(!showMap);
    };

    const openGoogleMaps = (address) => {
        const destination = encodeURIComponent(
            `${address.restaurantName}, ${address.address}`
        );
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
        window.open(googleMapsUrl, '_blank');
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
                            <h1 className="text-3xl font-bold text-gray-900">Redeem Points</h1>
                            <p className="text-gray-800 mt-1">Your Points: {remainingPoints}</p>
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
                
                {/* Points Status */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Your Bonus Points</h2>
                            <p className="text-gray-600 mt-1">
                                {remainingPoints < POINTS_REQUIRED 
                                    ? `You need ${POINTS_REQUIRED - remainingPoints} more points to claim an item.` 
                                    : `You have enough points to claim an item!`}
                            </p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-full">
                            <span className="text-3xl font-bold text-orange-600">{remainingPoints}</span>
                        </div>
                    </div>
                </div>
                
                {/* Restaurant Locations Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Redemption Locations</h2>
                        <button 
                            onClick={toggleMap}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                            </svg>
                            {showMap ? 'Hide Map' : 'Show Map'}
                        </button>
                    </div>
                    
                    {showMap && (
                        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-800 mb-3">Restaurant Locations</h3>
                            <div className="bg-white rounded-lg p-4 shadow">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    {restaurantAddresses.map((address, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <h4 className="font-medium text-gray-700">{address.restaurantName}</h4>
                                            <p className="text-sm text-gray-600">{address.address}</p>
                                            <button 
                                                onClick={() => openGoogleMaps(address)}
                                                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                                </svg>
                                                Directions
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                                        </svg>
                                        <p className="mt-2 text-gray-500">Map showing restaurant locations where you can redeem points</p>
                                        <p className="text-sm text-gray-400 mt-1">Click "Directions" for navigation to each location</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!showMap && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {restaurantAddresses.map((address, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700">{address.restaurantName}</h4>
                                    <p className="text-sm text-gray-600">{address.address}</p>
                                    <button 
                                        onClick={() => openGoogleMaps(address)}
                                        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                        Get Directions
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Receipt Modal */}
                {showReceipt && selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-bold text-center mb-6">Claim Receipt</h2>
                            
                            <div className="border-t border-b border-gray-200 py-4 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Item:</span>
                                    <span className="font-medium">{selectedProduct.name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Points Used:</span>
                                    <span className="font-medium">{POINTS_REQUIRED}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Remaining Points:</span>
                                    <span className="font-medium">{remainingPoints}</span>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-gray-600 font-semibold">Receipt Code:</span>
                                    <div className="flex items-center">
                                        <span className="font-bold text-yellow-600 mr-2">{receiptCode}</span>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(receiptCode);
                                                alert('Receipt code copied to clipboard!');
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Copy to clipboard"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center mb-6">
                                <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                                    <QRCodeSVG value={receiptCode} size={150} level="H" includeMargin={true} />
                                </div>
                                
                                <div className="text-center">
                                    <p className="text-gray-700 font-medium mb-2">Instructions:</p>
                                    <p className="text-gray-700">1. Visit our restaurant to claim your item</p>
                                    <p className="text-gray-700">2. Show this QR code or receipt code to the restaurant staff</p>
                                    <p className="text-gray-700">3. The code is valid for 24 hours</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-center">
                                <button 
                                    onClick={handleGoToStore}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Go to Restaurant
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Products Grid */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Available Items</h2>
                        <p className="text-gray-600 mt-1">Each item requires {POINTS_REQUIRED} points to claim</p>
                    </div>
                    
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                                <p className="mt-3 text-gray-600">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"></path>
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">No products available</h3>
                                <p className="mt-1 text-gray-500">There are no products available for redemption at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(product => (
                                    <div 
                                        key={product._id} 
                                        className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${selectedProduct && selectedProduct._id === product._id ? 'ring-2 ring-yellow-500' : ''}`}
                                        onClick={() => handleProductSelect(product)}
                                    >
                                        <div className="h-48 bg-gray-200 overflow-hidden">
                                            {product.image ? (
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                            <p className="text-gray-600 mt-1">{product.description || 'No description available'}</p>
                                            <div className="mt-4 flex justify-between items-center">
                                                <span className="text-yellow-600 font-medium">{POINTS_REQUIRED} points</span>
                                                {selectedProduct && selectedProduct._id === product._id && (
                                                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Claim Button */}
                        {remainingPoints >= POINTS_REQUIRED && selectedProduct && (
                            <div className="mt-8 flex justify-center">
                                <button 
                                    onClick={handleClaim}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Claim Selected Item
                                </button>
                            </div>
                        )}
                        
                        {remainingPoints < POINTS_REQUIRED && (
                            <div className="mt-8 flex justify-center">
                                <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-medium">
                                    You need {POINTS_REQUIRED - remainingPoints} more points to claim an item
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RedeemPoints;