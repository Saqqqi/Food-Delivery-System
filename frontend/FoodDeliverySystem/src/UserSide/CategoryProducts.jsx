import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaSearch, FaFilter } from 'react-icons/fa';
import { FiShoppingBag, FiHeart, FiMapPin } from 'react-icons/fi';
import Cart from './Cart/Cart';
import ReviewModal from './Reviews/ReviewModal';
import ReviewList from './Reviews/ReviewList';
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const CategoryProducts = () => {
    const [productsByCategory, setProductsByCategory] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [showCart, setShowCart] = useState(false);
    const [cartProducts, setCartProducts] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReviewList, setShowReviewList] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [activeRestaurant, setActiveRestaurant] = useState(null);

    // Fetch Products and Restaurants
    useEffect(() => {
        // Fetch products
        axios.get('http://localhost:3005/products')
            .then(response => {

                const grouped = response.data.reduce((acc, product) => {
                    const existing = acc.find(c => c.category === product.category);
                    const newProduct = {
                        ...product,
                        name: product.name,
                        price: product.price,
                        _id: product._id,
                        image: product.image,
                        description: product.description,
                    };
                    if (existing) {
                        existing.products.push(newProduct);
                    } else {
                        acc.push({ category: product.category, products: [newProduct] });
                    }
                    return acc;
                }, []);
                setProductsByCategory(grouped);

                // Initialize quantity state for each product
                const initialQuantities = {};
                response.data.forEach(product => {
                    initialQuantities[product._id] = 1;
                });
                setQuantities(initialQuantities);

                // Set first category as active by default
                if (grouped.length > 0) {
                    setActiveCategory(grouped[0].category);
                }
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });

        // Fetch restaurants
        axios.get('http://localhost:3005/api/restaurant-delivery-addresses')
            .then(response => {
                // Add default restaurant if not already in the list
                const defaultRestaurant = { _id: 'our', restaurantName: 'Our Restaurant' };
                const restaurantList = [defaultRestaurant, ...response.data];
                setRestaurants(restaurantList);
            })
            .catch(error => {
                console.error("Error fetching restaurants:", error);
                // Set default restaurant if API fails
                setRestaurants([{ _id: 'our', restaurantName: 'Our Restaurant' }]);
            });
    }, []);

    // Get user ID from token or localStorage
    const getUserId = () => {
        try {
            const token = localStorage.getItem("FoodCustomerToken");
            if (!token) return null;

            const decoded = jwtDecode(token);
            // Try to get userId from different possible properties
            if (decoded.id) return decoded.id;
            if (decoded._id) return decoded._id;

            // If still no userId, try to get from localStorage
            const userDataStr = localStorage.getItem("FoodCustomerUser");
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    if (userData.id) return userData.id;
                    if (userData._id) return userData._id;
                } catch (e) {
                    console.error("Error parsing user data from localStorage:", e);
                }
            }

            return null;
        } catch (e) {
            console.error("Error getting user ID:", e);
            return null;
        }
    };

    // Fetch Cart Data
    const fetchCart = useCallback(async () => {
        try {
            const userId = getUserId();
            if (!userId) {
                console.warn("User ID not found, cannot fetch cart");
                setCartProducts([]);
                return;
            }

            const response = await axios.get(`http://localhost:3005/cart/get-cart/${userId}`);
            setCartProducts(response.data.products || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartProducts([]);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const toggleCartCanvas = () => {
        setShowCart(!showCart);
    };

    const handleAddToBasket = async (product) => {
        try {
            const token = localStorage.getItem("FoodCustomerToken");
            const quantity = quantities[product._id];

            if (!token) {
                alert("Please login to add items to your basket.");
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;
            const payload = {
                product_id: product._id,
                userId: userId,
                quantity,
            };

            const res = await axios.post('http://localhost:3005/cart/add-product-to-cart', payload);

            if (res.status === 200 || res.status === 201) {
                // Animation effect
                const addButton = document.getElementById(`add-btn-${product._id}`);
                if (addButton) {
                    addButton.classList.add('animate-ping');
                    setTimeout(() => addButton.classList.remove('animate-ping'), 500);
                }

                await fetchCart();
            } else {
                alert("Failed to add to basket.");
            }
        } catch (error) {
            console.error("Error adding to basket:", error);
            alert("An error occurred while adding to basket.");
        }
    };

    const toggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const increaseQuantity = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: prev[productId] + 1
        }));
    };

    const decreaseQuantity = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: prev[productId] > 1 ? prev[productId] - 1 : 1
        }));
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        const section = document.getElementById(category);
        if (section) section.scrollIntoView({ behavior: "smooth" });
    };

    const handleRestaurantChange = (restaurantId) => {
        setActiveRestaurant(restaurantId === 'all' ? null : restaurantId);
    };

    const filteredCategories = productsByCategory.map(category => ({
        ...category,
        products: category.products.filter(product =>
            (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!activeRestaurant || product.restaurant?.id === activeRestaurant)
        )
    })).filter(category => category.products.length > 0);

    // Calculate total cart items for badge
    const cartItemCount = cartProducts.reduce((total, item) => total + item.quantity, 0);

    // Product card animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Floating Cart Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 z-50 bg-yellow-400 text-black rounded-full p-4 shadow-xl flex items-center justify-center"
                onClick={toggleCartCanvas}
                style={{ width: '64px', height: '64px' }}
                aria-label="Open cart"
            >
                <FiShoppingBag size={24} />
                {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {cartItemCount}
                    </span>
                )}
            </motion.button>

            <div className="container mx-auto px-4 py-8">
                {/* Header with search */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Delicious Menu</h2>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-grow">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for dishes..."
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                            <FaFilter /> Filters
                        </button>
                    </div>

                    {/* Restaurant Filter */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <FiMapPin className="mr-2" /> Restaurants
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleRestaurantChange('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeRestaurant ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                All Restaurants
                            </button>
                            {restaurants.map(restaurant => (
                                <button
                                    key={restaurant._id}
                                    onClick={() => handleRestaurantChange(restaurant._id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeRestaurant === restaurant._id ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {restaurant.restaurantName}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Categories sidebar */}
                    <div className="lg:w-1/5">
                        <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Categories</h3>
                            <ul className="space-y-2">
                                {productsByCategory.map(({ category }) => (
                                    <li key={category}>
                                        <button
                                            onClick={() => handleCategoryChange(category)}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeCategory === category ? 'bg-yellow-100 text-yellow-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            {category}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Products grid */}
                    <div className="lg:w-4/5">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(({ category, products }) => (
                                <div key={category} id={category} className="mb-12">
                                    <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-yellow-400 pb-2 inline-block">
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {products.map(product => (
                                            <motion.div
                                                key={product._id}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover={{ y: -5 }}
                                                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={`http://localhost:3005/${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <button
                                                        onClick={() => toggleWishlist(product._id)}
                                                        className="absolute top-3 right-3 bg-white/80 rounded-full p-2 hover:bg-white transition"
                                                        aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                                                    >
                                                        <FiHeart
                                                            size={20}
                                                            className={wishlist.includes(product._id) ? "text-red-500 fill-current" : "text-gray-600"}
                                                        />
                                                    </button>
                                                    {product.isPopular && (
                                                        <div className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                                                            Popular
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                                                        <span className="text-yellow-600 font-bold">Rs. {product.price}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                                                    {/* Rating and reviews */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                i < 4 ? (
                                                                    <FaStar key={i} className="text-yellow-400" />
                                                                ) : (
                                                                    <FaRegStar key={i} className="text-yellow-400" />
                                                                )
                                                            ))}
                                                            <span className="text-gray-500 text-sm ml-1">(24)</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setShowReviewList(true);
                                                            }}
                                                            className="text-sm text-gray-500 hover:text-yellow-600"
                                                        >
                                                            See reviews
                                                        </button>
                                                    </div>

                                                    {/* Quantity controls */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                                            <button
                                                                onClick={() => decreaseQuantity(product._id)}
                                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-3">{quantities[product._id]}</span>
                                                            <button
                                                                onClick={() => increaseQuantity(product._id)}
                                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                                aria-label="Increase quantity"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setShowReviewModal(true);
                                                            }}
                                                            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                                                        >
                                                            Add review
                                                        </button>
                                                    </div>

                                                    {/* Add to cart button */}
                                                    <button
                                                        id={`add-btn-${product._id}`}
                                                        onClick={() => handleAddToBasket(product)}
                                                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                                                    >
                                                        <FiShoppingBag /> Add to Cart
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl text-gray-600">No products found matching your search</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Component */}
            <Cart showCart={showCart} toggleCartCanvas={toggleCartCanvas} />

            {/* Review Modal */}
            {selectedProduct && (
                <ReviewModal
                    show={showReviewModal}
                    handleClose={() => setShowReviewModal(false)}
                    productId={selectedProduct._id}
                    productName={selectedProduct.name}
                    onReviewAdded={() => {
                        // Trigger refresh of review list
                        setReviewRefreshTrigger(prev => prev + 1);
                    }}
                />
            )}

            {/* Review List Modal */}
            {selectedProduct && (
                <ReviewList
                    show={showReviewList}
                    handleClose={() => setShowReviewList(false)}
                    productId={selectedProduct._id}
                    productName={selectedProduct.name}
                    refreshTrigger={reviewRefreshTrigger}
                />
            )}
        </div>
    );
};

export default CategoryProducts;