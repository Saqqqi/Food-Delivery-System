import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { FaUtensils } from 'react-icons/fa';

const Cart = ({ showCart, toggleCartCanvas }) => {
  const [open, setOpen] = useState(true);
  const [cartProducts, setCartProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(0);
  const [loyaltyRules, setLoyaltyRules] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [appliedLoyaltyDiscount, setAppliedLoyaltyDiscount] = useState(null);
  const [loyaltyError, setLoyaltyError] = useState('');
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);
  const [discountType, setDiscountType] = useState('none');
  const [showExtraItems, setShowExtraItems] = useState(false);
  const [extraItems, setExtraItems] = useState([]);
  const [selectedExtraItems, setSelectedExtraItems] = useState([]);
  const [loadingExtraItems, setLoadingExtraItems] = useState(false);

  const getUserId = useCallback(() => {
    const token = localStorage.getItem("FoodCustomerToken");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.id || decoded.userId || decoded._id;
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      setLoadingCoupon(true);
      const userId = getUserId();
      if (!userId) return;

      await axios.delete(`http://localhost:3005/cart/remove-coupon/${userId}`);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setFinalAmount(totalAmount);
      setCouponError('');
      setDiscountType('none');
    } catch (error) {
      console.error("Error removing coupon:", error);
    } finally {
      setLoadingCoupon(false);
    }
  }, [getUserId, totalAmount]);

  const removeLoyaltyDiscount = useCallback(async () => {
    try {
      setLoadingLoyalty(true);
      const userId = getUserId();
      if (!userId) return;

      await axios.delete(`http://localhost:3005/cart/remove-loyalty-discount/${userId}`);
      if (appliedLoyaltyDiscount?.pointsRedeemed) {
        await axios.post(`http://localhost:3005/loyalty/refund-points/${userId}`, {
          points: appliedLoyaltyDiscount.pointsRedeemed
        });
        setUserLoyaltyPoints(prev => prev + appliedLoyaltyDiscount.pointsRedeemed);
      }

      setAppliedLoyaltyDiscount(null);
      setDiscountAmount(0);
      setFinalAmount(totalAmount);
      setLoyaltyError('');
      setDiscountType('none');
    } catch (error) {
      console.error("Error removing loyalty discount:", error);
    } finally {
      setLoadingLoyalty(false);
    }
  }, [getUserId, appliedLoyaltyDiscount, totalAmount]);

  const fetchAvailableCoupons = useCallback(async () => {
    try {
      const productsForValidation = cartProducts.map(item => ({
        productId: item.productId,
        price: item.product_ID?.price || 0,
        quantity: item.quantity
      }));

      const response = await axios.post('http://localhost:3005/api/coupons/available', {
        orderAmount: totalAmount,
        products: productsForValidation
      });

      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      try {
        const response = await axios.get('http://localhost:3005/api/coupons');
        const eligibleCoupons = response.data.filter(coupon =>
          coupon.isActive &&
          new Date(coupon.startDate) <= new Date() &&
          new Date(coupon.endDate) >= new Date() &&
          (!coupon.minOrderAmount || totalAmount >= coupon.minOrderAmount)
        );
        setCoupons(eligibleCoupons);
      } catch (fallbackError) {
        console.error("Fallback coupon fetch failed:", fallbackError);
        setCoupons([]);
      }
    }
  }, [cartProducts, totalAmount]);



  useEffect(() => {
    if (showCart && totalAmount > 0) {
      fetchAvailableCoupons();
    }
  }, [showCart, totalAmount, fetchAvailableCoupons]);



  const fetchUserLoyaltyPoints = useCallback(async () => {
    try {
      setLoadingLoyalty(true);
      const userId = getUserId();
      if (!userId) return;

      const [pointsResponse, rulesResponse] = await Promise.all([
        axios.get(`http://localhost:3005/loyalty/user-points/${userId}`),
        axios.get('http://localhost:3005/loyalty/rules')
      ]);

      setUserLoyaltyPoints(pointsResponse.data.points || 0);
      setLoyaltyRules(rulesResponse.data.data?.loyaltyRules || null);
    } catch (error) {
      console.error("Error fetching loyalty points:", error);
      setLoyaltyError(error.response?.data?.error || 'Failed to fetch loyalty points');
    } finally {
      setLoadingLoyalty(false);
    }
  }, [getUserId]);

  const fetchExtraItems = useCallback(async () => {
    try {
      setLoadingExtraItems(true);
      const response = await axios.get('http://localhost:3005/api/extra-items');
      if (response.data && response.data.data && response.data.data.extraItems) {
        setExtraItems(response.data.data.extraItems.filter(item => item.isAvailable));
      } else {
        setExtraItems([]);
      }
    } catch (error) {
      console.error("Error fetching extra items:", error);
      setExtraItems([]);
    } finally {
      setLoadingExtraItems(false);
    }
  }, []);

  const handleAddExtraItem = useCallback((item) => {
    // Check if the item is already in selectedExtraItems
    const existingItemIndex = selectedExtraItems.findIndex(i => i._id === item._id);

    if (existingItemIndex >= 0) {
      // If item exists, remove it
      const updatedItems = [...selectedExtraItems];
      updatedItems.splice(existingItemIndex, 1);
      setSelectedExtraItems(updatedItems);
      toast.info(`Removed ${item.name} from extras`);
    } else {
      // If item doesn't exist, add it with quantity 1
      setSelectedExtraItems([...selectedExtraItems, { ...item, quantity: 1 }]);
      toast.success(`Added ${item.name} to extras`);
    }
  }, [selectedExtraItems]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        setCartProducts([]);
        setTotalAmount(0);
        setFinalAmount(0);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setAppliedLoyaltyDiscount(null);
        return;
      }

      const response = await axios.get(`http://localhost:3005/cart/get-cart/${userId}`);
      const cartData = response.data;
      const productsWithIds = cartData.products.map(item => ({
        ...item,
        productId: typeof item.product_ID === 'object' ? item.product_ID?._id : item.product_ID
      }));

      setCartProducts(productsWithIds);
      setTotalAmount(cartData.sub_total || 0);

      if (productsWithIds.length === 0 || !cartData.sub_total) {
        setAppliedCoupon(null);
        setAppliedLoyaltyDiscount(null);
        setDiscountAmount(0);
        setFinalAmount(0);
        setDiscountType('none');

        // Clean up backend discounts directly if cart is empty
        if (cartData.coupon?.code) {
          try { await axios.delete(`http://localhost:3005/cart/remove-coupon/${userId}`); } catch (e) { console.error(e); }
        }
        if (cartData.loyaltyDiscount?.pointsRedeemed > 0) {
          try {
            await axios.delete(`http://localhost:3005/cart/remove-loyalty-discount/${userId}`);
            await axios.post(`http://localhost:3005/loyalty/refund-points/${userId}`, {
              points: cartData.loyaltyDiscount.pointsRedeemed
            });
            setUserLoyaltyPoints(prev => prev + cartData.loyaltyDiscount.pointsRedeemed);
          } catch (e) { console.error(e); }
        }
      } else if (cartData.discountType === 'coupon' && cartData.coupon?.code) {
        setAppliedCoupon({
          code: cartData.coupon.code,
          discount: cartData.coupon.discountAmount || 0,
          type: cartData.coupon.type || 'price',
          isPercentage: cartData.coupon.isPercentage || false,
          discountAmount: cartData.coupon.discountAmount || 0,
          minOrderAmount: cartData.coupon.minOrderAmount || 0
        });
        setAppliedLoyaltyDiscount(null);
        setDiscountAmount(cartData.coupon.discountAmount || 0);
        setFinalAmount(cartData.final_total || (cartData.sub_total - (cartData.coupon.discountAmount || 0)));
        setDiscountType('coupon');
      } else if (cartData.discountType === 'loyalty' && cartData.loyaltyDiscount?.pointsRedeemed > 0) {
        setAppliedLoyaltyDiscount({
          pointsRedeemed: cartData.loyaltyDiscount.pointsRedeemed || 0,
          discountAmount: cartData.loyaltyDiscount.discountAmount || 0
        });
        setAppliedCoupon(null);
        setDiscountAmount(cartData.loyaltyDiscount.discountAmount || 0);
        setFinalAmount(cartData.final_total || (cartData.sub_total - (cartData.loyaltyDiscount.discountAmount || 0)));
        setDiscountType('loyalty');
      } else {
        setAppliedCoupon(null);
        setAppliedLoyaltyDiscount(null);
        setDiscountAmount(0);
        setFinalAmount(cartData.sub_total || 0);
        setDiscountType('none');
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartProducts([]);
      setTotalAmount(0);
      setFinalAmount(0);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setAppliedLoyaltyDiscount(null);
    } finally {
      setLoading(false);
    }
  }, [getUserId, setUserLoyaltyPoints]);

  useEffect(() => {
    if (showCart && totalAmount > 0) {
      fetchAvailableCoupons();
    }
  }, [showCart, totalAmount, fetchAvailableCoupons]);

  useEffect(() => {
    if (showCart) {
      fetchCart();
      fetchUserLoyaltyPoints();
      fetchExtraItems();
    }
  }, [showCart, fetchCart, fetchUserLoyaltyPoints, fetchExtraItems]);

  useEffect(() => {
    if (showCart && appliedCoupon?.type === 'price' && appliedCoupon?.minOrderAmount && totalAmount < appliedCoupon.minOrderAmount) {
      removeCoupon();
    }
  }, [showCart, totalAmount, appliedCoupon, removeCoupon]);

  // handleAddToCart removed as it was unused

  const handleRemoveItem = useCallback(async (productId) => {
    if (!window.confirm("Are you sure you want to remove this item from the cart?")) return;

    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        alert("Please login to modify the cart.");
        return;
      }

      await axios.delete(`http://localhost:3005/cart/remove-product/${userId}/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.response?.data?.error || "Failed to remove item from cart.");
    } finally {
      setLoading(false);
    }
  }, [getUserId, fetchCart]);

  const handleQuantityChange = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        alert("Please login to modify the cart.");
        return;
      }

      await axios.put(`http://localhost:3005/cart/update-quantity/${userId}/${productId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.response?.data?.error || "Failed to update quantity.");
    } finally {
      setLoading(false);
    }
  }, [getUserId, fetchCart]);

  const handleImageError = useCallback((e, productId) => {
    if (!failedImages.has(productId)) {
      setFailedImages(prev => new Set(prev).add(productId));
      e.target.src = 'https://placehold.co/64x64';
    }
  }, [failedImages]);

  const getImageSrc = useCallback((image) => {
    return image ? `http://localhost:3005/${image}` : 'https://placehold.co/64x64';
  }, []);



  const applyCoupon = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("applyCoupon triggered with couponCode:", couponCode);

    try {
      setCouponError('');
      setLoadingCoupon(true);

      if (!couponCode.trim()) {
        setCouponError('Please enter a coupon code');
        console.log("Coupon code empty, exiting applyCoupon");
        return;
      }

      const userId = getUserId();
      if (!userId) {
        setCouponError('Please login to apply coupons');
        console.log("No user ID, exiting applyCoupon");
        return;
      }

      if (discountType === 'loyalty' && appliedLoyaltyDiscount) {
        console.log("Removing existing loyalty discount");
        await removeLoyaltyDiscount();
      }

      const productsForValidation = cartProducts.map(item => ({
        productId: item.productId,
        price: item.product_ID?.price || 0,
        quantity: item.quantity
      }));

      console.log("Validating coupon with API:", couponCode);
      const validateResponse = await axios.post('http://localhost:3005/api/coupons/validate', {
        code: couponCode,
        orderAmount: totalAmount,
        products: productsForValidation
      });

      const { valid, coupon, discountAmount, finalAmount } = validateResponse.data;
      console.log("Coupon validation response:", { valid, coupon, discountAmount, finalAmount });

      if (valid) {
        console.log("Applying coupon to cart:", coupon.code);
        await axios.put(`http://localhost:3005/cart/apply-coupon/${userId}`, {
          couponCode: coupon.code,
          discountAmount: discountAmount || 0,
          couponType: coupon.type,
          isPercentage: coupon.isPercentage || false
        });

        // Update state without triggering a full refresh
        setAppliedCoupon({
          code: coupon.code,
          discount: discountAmount || 0,
          type: coupon.type,
          isPercentage: coupon.isPercentage || false,
          discountAmount: discountAmount || 0,
          minOrderAmount: coupon.minOrderAmount || 0
        });
        setDiscountAmount(discountAmount || 0);
        setFinalAmount(finalAmount || (totalAmount - (discountAmount || 0)));
        setCouponCode('');
        setDiscountType('coupon');
        setAppliedLoyaltyDiscount(null);
        setCouponError('');
        console.log("Coupon applied successfully");
      } else {
        setCouponError('Invalid coupon');
        console.log("Coupon invalid");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError(error.response?.data?.error || 'Failed to apply coupon');
    } finally {
      setLoadingCoupon(false);
    }
  }, [couponCode, getUserId, discountType, appliedLoyaltyDiscount, cartProducts, totalAmount, removeLoyaltyDiscount]);

  const applyLoyaltyDiscount = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setLoyaltyError('');
      setLoadingLoyalty(true);

      const pointsToUse = parseInt(pointsToRedeem);
      if (!pointsToUse || pointsToUse <= 0) {
        setLoyaltyError('Please enter a valid number of points');
        return;
      }

      if (pointsToUse > userLoyaltyPoints) {
        setLoyaltyError(`You only have ${userLoyaltyPoints} points available`);
        return;
      }

      if (discountType === 'coupon' && appliedCoupon) {
        await removeCoupon();
      }

      const userId = getUserId();
      if (!userId) {
        setLoyaltyError('Please login to redeem points');
        return;
      }

      const redemptionRate = loyaltyRules?.redemptionRate || 0.1;
      const calculatedDiscount = pointsToUse * redemptionRate;
      const finalDiscount = Math.min(calculatedDiscount, totalAmount);
      const finalPointsUsed = Math.ceil(finalDiscount / redemptionRate);

      const response = await axios.put(`http://localhost:3005/cart/apply-loyalty-points/${userId}`, {
        pointsToRedeem: finalPointsUsed
      });

      if (response.data.success) {
        const { pointsRedeemed, discountAmount } = response.data.cart.loyaltyDiscount;
        setAppliedLoyaltyDiscount({ pointsRedeemed, discountAmount });
        setDiscountAmount(discountAmount);
        setFinalAmount(response.data.cart.final_total);
        setPointsToRedeem('');
        setDiscountType('loyalty');
        setAppliedCoupon(null);
        setUserLoyaltyPoints(prev => prev - pointsRedeemed);
      }
    } catch (error) {
      console.error("Error applying loyalty discount:", error);
      setLoyaltyError(error.response?.data?.error || 'Failed to apply loyalty discount');
    } finally {
      setLoadingLoyalty(false);
    }
  }, [pointsToRedeem, userLoyaltyPoints, discountType, appliedCoupon, getUserId, loyaltyRules, totalAmount, removeCoupon]);



  // Functions moved up to fix dependency issues in fetchCart
  // see below 


  const handleCheckout = () => {
    // Calculate the total price of extra items
    const extraItemsTotal = selectedExtraItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Store checkout data in localStorage
    const checkoutData = {
      cartProducts: cartProducts,
      extraItems: selectedExtraItems,
      totalAmount: totalAmount,
      discountAmount: discountAmount,
      discountType: discountType,
      appliedCoupon: appliedCoupon,
      appliedLoyaltyDiscount: appliedLoyaltyDiscount,
      finalAmount: (discountAmount > 0 ? finalAmount : totalAmount) + extraItemsTotal
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
  };

  if (!showCart) return null;

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel className="w-screen max-w-md bg-white shadow-2xl rounded-lg transform transition-transform duration-300 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white flex justify-between items-center rounded-t-lg">
                  <DialogTitle className="text-xl font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Your Cart
                    <span className="ml-2 bg-white text-red-600 text-sm rounded-full px-2 py-1 font-bold">
                      {cartProducts.length} {cartProducts.length === 1 ? 'item' : 'items'}
                    </span>
                  </DialogTitle>
                  <button
                    onClick={toggleCartCanvas}
                    className="text-white hover:text-gray-200 transition-colors duration-200 bg-red-600 hover:bg-red-700 rounded-full p-2"
                    aria-label="Close cart"
                    type="button"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-4 flex-1">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                  ) : cartProducts.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium">Your cart is empty</p>
                      <p className="text-sm mt-2">Add some delicious items to get started!</p>
                    </div>
                  ) : (
                    <>
                      <ul className="divide-y divide-gray-200">
                        {cartProducts.map((item) => (
                          <li key={item._id} className="flex py-6 items-center hover:bg-gray-50 rounded-xl px-3 transition-all duration-200">
                            <div className="relative">
                              <img
                                src={getImageSrc(item.product_ID?.image)}
                                alt={item.product_ID?.name || 'Product image'}
                                className="w-20 h-20 rounded-xl border border-gray-200 object-cover shadow-sm"
                                onError={(e) => handleImageError(e, item.productId)}
                              />
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="ml-4 flex-1">
                              <h3 className="text-lg font-medium text-gray-900">{item.product_ID?.name || 'Unknown Product'}</h3>
                              <div className="flex items-center mt-1">
                                <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">{item.product_ID?.category || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <p className="font-semibold text-red-500 text-lg">
                                  Rs. {(item.product_ID?.price || 0) * item.quantity}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Rs. {item.product_ID?.price || 0} each
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col space-y-2">
                              <div className="flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm">
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="px-3 py-1 text-red-500 font-bold hover:bg-red-50 rounded-l-lg transition-colors duration-200"
                                  disabled={item.quantity <= 1}
                                  type="button"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 font-medium text-gray-700">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="px-3 py-1 text-green-500 font-bold hover:bg-green-50 rounded-r-lg transition-colors duration-200"
                                  type="button"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.productId)}
                                className="flex items-center justify-center text-sm text-red-500 font-semibold hover:text-red-700 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-red-50 border border-red-200"
                                aria-label={`Remove ${item.product_ID?.name || 'product'} from cart`}
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 border-t pt-4">
                        <h3 className="text-lg font-medium mb-2">Discount Options</h3>
                        <div className="flex space-x-2 mb-4">
                          <button
                            onClick={() => {
                              if (discountType === 'coupon') {
                                setDiscountType('none');
                                if (appliedCoupon) removeCoupon();
                              } else {
                                setDiscountType('coupon');
                                if (appliedLoyaltyDiscount) removeLoyaltyDiscount();
                              }
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${discountType === 'coupon' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            type="button"
                          >
                            Coupon
                          </button>
                          <button
                            onClick={() => {
                              if (discountType === 'loyalty') {
                                setDiscountType('none');
                                if (appliedLoyaltyDiscount) removeLoyaltyDiscount();
                              } else {
                                setDiscountType('loyalty');
                                if (appliedCoupon) removeCoupon();
                              }
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${discountType === 'loyalty' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            type="button"
                          >
                            Loyalty Points
                          </button>
                          <button
                            onClick={() => setShowExtraItems(!showExtraItems)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${showExtraItems ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            type="button"
                          >
                            Extra Items
                          </button>
                        </div>
                        {(discountType === 'coupon' || appliedCoupon) && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium mb-2">Apply Coupon</h4>
                            {appliedCoupon ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                                    <p className="text-sm text-green-600">
                                      {appliedCoupon.isPercentage
                                        ? `${appliedCoupon.discount || 0}% off`
                                        : `Rs. ${appliedCoupon.discountAmount || appliedCoupon.discount || 0} off`}
                                      {appliedCoupon.type === 'product' && ' on selected products'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={removeCoupon}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                                    disabled={loadingCoupon}
                                    type="button"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : discountType === 'coupon' && (
                              <div className="mb-3">
                                <div className="flex flex-col space-y-2">
                                  {coupons.length > 0 && (
                                    <div className="relative">
                                      <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={loadingCoupon}
                                      >
                                        <option value="">Select a coupon</option>
                                        {coupons.map(coupon => (
                                          <option key={coupon._id} value={coupon.code}>
                                            {coupon.code} - {coupon.isPercentage ? `${coupon.discount}% off` : `Rs. ${coupon.discount} off`}
                                            {coupon.type === 'price' ? ` (Min: Rs. ${coupon.minOrderAmount})` : ''}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex space-x-2">
                                    <input
                                      type="text"
                                      value={couponCode}
                                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                      placeholder="Enter coupon code"
                                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                      disabled={loadingCoupon}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          console.log("Enter key pressed in coupon input");
                                          applyCoupon(e);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        console.log("Apply button clicked");
                                        applyCoupon(e);
                                      }}
                                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
                                      disabled={!couponCode.trim() || loadingCoupon}
                                      type="button"
                                    >
                                      {loadingCoupon ? 'Applying...' : 'Apply'}
                                    </button>
                                  </div>
                                </div>
                                {couponError && (
                                  <p className="text-red-500 text-sm mt-1">{couponError}</p>
                                )}
                              </div>
                            )}
                            {coupons.length > 0 && !appliedCoupon && discountType === 'coupon' && (
                              <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  Available Coupons:
                                </p>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                  {coupons.map(coupon => (
                                    <div
                                      key={coupon._id}
                                      className="border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-red-200 hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden"
                                      onClick={() => setCouponCode(coupon.code)}
                                    >
                                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                        <div className="bg-red-500 text-white text-xs font-bold py-1 transform rotate-45 origin-bottom-right absolute top-0 right-0 w-24 text-center shadow-sm">
                                          SAVE
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="font-bold text-gray-800 text-lg">{coupon.code}</p>
                                          <div className="mt-1 flex items-center">
                                            <span className="text-lg font-bold text-red-500">
                                              {coupon.isPercentage
                                                ? `${coupon.discount || 0}%`
                                                : `Rs. ${coupon.discount || 0}`}
                                            </span>
                                            <span className="ml-1 text-sm text-gray-600 font-medium">OFF</span>
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {coupon.type === 'price'
                                              ? `Valid on orders above Rs. ${coupon.minOrderAmount || 0}`
                                              : 'Valid on selected products'}
                                          </p>
                                        </div>
                                        <button
                                          className="text-sm bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm font-medium"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("Coupon list Apply button clicked for:", coupon.code);
                                            setCouponCode(coupon.code);
                                            applyCoupon(e);
                                          }}
                                          type="button"
                                        >
                                          Apply
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {(discountType === 'loyalty' || appliedLoyaltyDiscount) && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium mb-2">Redeem Loyalty Points</h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700">Available Points: <span className="font-bold text-red-500">{userLoyaltyPoints}</span></p>
                              {loyaltyRules && (
                                <>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Each point is worth Rs. {loyaltyRules.redemptionRate || 0.1}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Minimum {loyaltyRules.minPointsToRedeem || 100} points required to redeem
                                  </p>
                                </>
                              )}
                            </div>
                            {appliedLoyaltyDiscount ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-green-800">{appliedLoyaltyDiscount.pointsRedeemed} Points Redeemed</p>
                                    <p className="text-sm text-green-600">
                                      Rs. {appliedLoyaltyDiscount.discountAmount} discount applied
                                    </p>
                                  </div>
                                  <button
                                    onClick={removeLoyaltyDiscount}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                                    disabled={loadingLoyalty}
                                    type="button"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ) : discountType === 'loyalty' && (
                              <div className="mb-3">
                                <div className="flex space-x-2">
                                  <input
                                    type="number"
                                    value={pointsToRedeem}
                                    onChange={(e) => setPointsToRedeem(e.target.value)}
                                    placeholder="Enter points to redeem"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    disabled={loadingLoyalty}
                                    min="1"
                                    max={userLoyaltyPoints}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        applyLoyaltyDiscount(e);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={(e) => applyLoyaltyDiscount(e)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
                                    disabled={!pointsToRedeem || parseInt(pointsToRedeem) <= 0 || parseInt(pointsToRedeem) > userLoyaltyPoints || loadingLoyalty}
                                    type="button"
                                  >
                                    {loadingLoyalty ? 'Applying...' : 'Apply'}
                                  </button>
                                </div>
                                {loyaltyError && (
                                  <p className="text-red-500 text-sm mt-1">{loyaltyError}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {showExtraItems && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium mb-2">Add Extra Items</h4>
                            {loadingExtraItems ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500"></div>
                              </div>
                            ) : extraItems.length === 0 ? (
                              <p className="text-gray-500 text-sm">No extra items available</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {extraItems.map(item => {
                                  const isSelected = selectedExtraItems.some(i => i._id === item._id);
                                  return (
                                    <div
                                      key={item._id}
                                      className={`border ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg p-3 flex justify-between items-center hover:border-red-200 hover:shadow-sm transition-all duration-200`}
                                    >
                                      <div className="flex items-center">
                                        <img
                                          src={item.image ? item.image : 'https://via.placeholder.com/50?text=Food'}
                                          alt={item.name}
                                          className="w-12 h-12 rounded-md object-cover mr-3"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/50?text=Food';
                                          }}
                                        />
                                        <div>
                                          <h5 className="font-medium text-gray-800">{item.name}</h5>
                                          <p className="text-sm text-gray-500">{item.description}</p>
                                          <p className="text-red-500 font-medium">Rs. {item.price}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleAddExtraItem(item)}
                                        className={`${isSelected ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200`}
                                        disabled={loading}
                                        type="button"
                                      >
                                        {isSelected ? 'Remove' : 'Add'}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 rounded-b-lg">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <p>Subtotal</p>
                        <p className="font-medium">Rs. {totalAmount}</p>
                      </div>
                      {selectedExtraItems.length > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <div>
                            <p className="flex items-center">
                              <FaUtensils className="h-4 w-4 mr-1 text-red-500" />
                              Extra Items
                            </p>
                            <ul className="text-xs text-gray-500 ml-2">
                              {selectedExtraItems.map((item, index) => (
                                <li key={index} className="flex justify-between">
                                  <span>{item.name}</span>
                                  <span className="ml-2">Rs. {item.price}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="font-medium">Rs. {selectedExtraItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)}</p>
                        </div>
                      )}
                      {discountAmount > 0 && totalAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <p className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {discountType === 'coupon' ? `Coupon Discount (${appliedCoupon?.code})` :
                              discountType === 'loyalty' ? `Loyalty Points Discount (${appliedLoyaltyDiscount?.pointsRedeemed} points)` :
                                'Discount'}
                          </p>
                          <p className="font-medium">- Rs. {discountAmount || 0}</p>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                        <p>Total</p>
                        <p className="text-red-600">
                          Rs. {totalAmount === 0 ? 0 : (
                            (discountAmount > 0 ? finalAmount : totalAmount) +
                            selectedExtraItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 text-center">Shipping and taxes calculated at checkout</p>
                  <Link to="/checkout" onClick={handleCheckout}>
                    <button
                      className={`mt-4 w-full py-3 rounded-xl text-lg font-bold transition-all duration-300 ${totalAmount === 0
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                      disabled={totalAmount === 0}
                      aria-label="Proceed to checkout"
                      type="button"
                    >
                      Proceed to Checkout
                    </button>
                  </Link>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Cart;