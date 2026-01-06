// Coupons.js - Admin Dashboard Coupons Management Component
import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaTrashAlt, FaPlus, FaEdit, FaCheck, FaTimes, FaPercent, FaDollarSign, FaTag, FaShoppingCart, FaAward } from "react-icons/fa";
import { toast } from 'react-toastify';

const API_URL = "http://localhost:3005/api/coupons";

const Coupons = ({ onItemClick }) => {
  // State variables
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loyaltyRules, setLoyaltyRules] = useState(null);
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'price',
    discount: 10,
    isPercentage: true,
    minOrderAmount: 100,
    applicableProducts: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    isActive: true,
    maxUses: null,
    description: ''
  });
  
  const itemsPerPage = 5;
  
  // Fetch coupons and products on component mount
  useEffect(() => {
    fetchCoupons();
    fetchProducts();
    fetchLoyaltyRules();
  }, []);
  
  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const adminKey = localStorage.getItem('food123');
      if (!adminKey) {
        toast.error('Admin authentication required');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(API_URL, {
        headers: { 'admin-key': adminKey }
      });
      setCoupons(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to fetch coupons");
      setLoading(false);
    }
  };
  
  // Fetch all products for selection
  const fetchProducts = async () => {
    try {
      const adminKey = localStorage.getItem('food123');
      if (!adminKey) {
        toast.error('Admin authentication required');
        return;
      }
      
      const response = await axios.get(`${API_URL}/products/all`, {
        headers: { 'admin-key': adminKey }
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isPercentage' || name === 'isActive') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'applicableProducts') {
      // Handle multi-select for products
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormData({ ...formData, [name]: selectedValues });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Open modal for adding new coupon
  const handleAddCoupon = () => {
    setEditMode(false);
    setFormData({
      code: '',
      type: 'price',
      discount: 10,
      isPercentage: true,
      minOrderAmount: 100,
      applicableProducts: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      isActive: true,
      maxUses: null,
      description: ''
    });
    setShowModal(true);
  };
  
  // Open modal for editing coupon
  const handleEditCoupon = (coupon) => {
    setEditMode(true);
    setSelectedCoupon(coupon);
    
    // Format dates for the form
    const startDate = coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '';
    const endDate = coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '';
    
    // Format applicable products
    const applicableProducts = coupon.applicableProducts 
      ? coupon.applicableProducts.map(p => p._id) 
      : [];
    
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      isPercentage: coupon.isPercentage,
      minOrderAmount: coupon.minOrderAmount,
      applicableProducts,
      startDate,
      endDate,
      isActive: coupon.isActive,
      maxUses: coupon.maxUses,
      description: coupon.description || ''
    });
    
    setShowModal(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Submit form to create or update coupon
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const adminKey = localStorage.getItem('food123');
      if (!adminKey) {
        toast.error('Admin authentication required');
        setLoading(false);
        return;
      }
      
      const headers = { 'admin-key': adminKey };
      
      if (editMode && selectedCoupon) {
        // Update existing coupon
        await axios.put(`${API_URL}/${selectedCoupon._id}`, formData, { headers });
        toast.success("Coupon updated successfully");
      } else {
        // Create new coupon
        await axios.post(API_URL, formData, { headers });
        toast.success("Coupon created successfully");
      }
      
      // Refresh coupons list and close modal
      fetchCoupons();
      setShowModal(false);
      setLoading(false);
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.error || "Failed to save coupon");
      setLoading(false);
    }
  };
  
  // Delete coupon
  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        setLoading(true);
        const adminKey = localStorage.getItem('food123');
        if (!adminKey) {
          toast.error('Admin authentication required');
          setLoading(false);
          return;
        }
        
        await axios.delete(`${API_URL}/${id}`, {
          headers: { 'admin-key': adminKey }
        });
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } catch (error) {
        console.error("Error deleting coupon:", error);
        toast.error("Failed to delete coupon");
        setLoading(false);
      }
    }
  };
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = coupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(coupons.length / itemsPerPage);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      // Format as 'MMM dd, yyyy' (e.g., 'Jan 01, 2023')
      const options = { month: 'short', day: '2-digit', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Function to navigate to loyalty points page
  const navigateToLoyaltyPoints = () => {
    if (typeof onItemClick === 'function') {
      onItemClick('loyalty-points');
    } else {
      toast.info('Navigation to Loyalty Points is not available');
    }
  };
  
  // Fetch loyalty rules
  const fetchLoyaltyRules = async () => {
    try {
      setLoadingLoyalty(true);
      const adminKey = localStorage.getItem('food123');
      if (!adminKey) {
        console.error('Admin key not found');
        return;
      }
      
      const response = await axios.get('/loyalty/settings', {
        baseURL: 'http://localhost:3005',
        headers: { 'admin-key': adminKey }
      });
      if (response.data.status === 'success') {
        setLoyaltyRules(response.data.data.loyaltyRules);
      }
    } catch (error) {
      console.error('Error fetching loyalty rules:', error);
      // Don't show error toast as loyalty points might not be set up yet
    } finally {
      setLoadingLoyalty(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-b from-black to-slate-900 rounded-xl shadow-lg border border-yellow-500/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-500 font-serif flex items-center">
              <FaTag className="mr-2" /> Coupon Management
            </h2>
            <button
              onClick={handleAddCoupon}
              className="flex items-center bg-blue-900/50 text-yellow-100 px-4 py-2 rounded-lg hover:bg-blue-800/70 border border-yellow-500/20 transition"
            >
              <FaPlus className="mr-2 text-yellow-400" /> Add Coupon
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full bg-gradient-to-b from-blue-900/30 to-black text-yellow-100 border border-yellow-500/20 rounded-lg overflow-hidden">
                  <thead className="bg-blue-900/50 text-yellow-400 border-b border-yellow-500/20">
                    <tr>
                      <th className="p-3 text-left font-serif">Code</th>
                      <th className="p-3 text-left font-serif">Discount</th>
                      <th className="p-3 text-left font-serif">Type</th>
                      <th className="p-3 text-left font-serif">Min Order</th>
                      <th className="p-3 text-left font-serif">Validity</th>
                      <th className="p-3 text-left font-serif">Status</th>
                      <th className="p-3 text-left font-serif">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCoupons.length < 1 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-4 text-yellow-400/60">No Coupons Found, Please Add Some...</td>
                      </tr>
                    ) : (
                      currentCoupons.map((coupon) => (
                        <tr key={coupon._id} className="border-b border-yellow-500/10 hover:bg-blue-900/20 transition">
                          <td className="p-3 font-mono font-bold">{coupon.code}</td>
                          <td className="p-3">
                            {coupon.isPercentage ? (
                              <span className="flex items-center"><FaPercent className="mr-1" /> {coupon.discount}%</span>
                            ) : (
                              <span className="flex items-center"><FaDollarSign className="mr-1" /> {coupon.discount}</span>
                            )}
                          </td>
                          <td className="p-3 capitalize">{coupon.type}</td>
                          <td className="p-3">₹{coupon.minOrderAmount}</td>
                          <td className="p-3 text-sm">
                            {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                          </td>
                          <td className="p-3">
                            {coupon.isActive ? (
                              <span className="flex items-center text-green-400"><FaCheck className="mr-1" /> Active</span>
                            ) : (
                              <span className="flex items-center text-red-400"><FaTimes className="mr-1" /> Inactive</span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleEditCoupon(coupon)}
                              className="bg-yellow-800/40 text-yellow-300 px-3 py-1 rounded hover:bg-yellow-700/70 border border-yellow-600 transition mr-2"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="bg-red-900/40 text-red-300 px-3 py-1 rounded hover:bg-red-800/70 border border-red-800 transition"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4 text-yellow-100">
                <button
                  className="px-3 py-1 bg-blue-900/40 border border-yellow-500/20 rounded hover:bg-blue-800/60 transition disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  className="px-3 py-1 bg-blue-900/40 border border-yellow-500/20 rounded hover:bg-blue-800/60 transition disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gradient-to-b from-black to-slate-900 border border-yellow-500/20 text-yellow-100 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-blue-900/40 border-b border-yellow-500/20 p-4 rounded-t-lg">
              <h2 className="text-lg font-semibold text-yellow-400">
                {editMode ? "Edit Coupon" : "Add New Coupon"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-yellow-300 text-xl hover:text-yellow-100 transition"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="code">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter coupon code"
                      required
                    />
                  </div>

                  {/* Discount */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="discount">
                      Discount Value *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        id="discount"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded-l text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="Enter discount value"
                        required
                        min="0"
                      />
                      <div className="flex items-center bg-blue-900/40 border border-yellow-500/30 border-l-0 rounded-r px-3">
                        <label className="flex items-center text-yellow-100">
                          <input
                            type="checkbox"
                            name="isPercentage"
                            checked={formData.isPercentage}
                            onChange={handleInputChange}
                            className="mr-2 h-4 w-4 text-yellow-500"
                          />
                          Percentage
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="type">
                      Coupon Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="price">Price Discount</option>
                      <option value="delivery">Free Delivery</option>
                      <option value="product">Product Discount</option>
                    </select>
                  </div>

                  {/* Min Order Amount */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="minOrderAmount">
                      Minimum Order Amount (₹) *
                    </label>
                    <input
                      type="number"
                      id="minOrderAmount"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Enter minimum order amount"
                      required
                      min="0"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="startDate">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="endDate">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>

                  {/* Max Uses */}
                  <div className="mb-4">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="maxUses">
                      Maximum Uses (Optional)
                    </label>
                    <input
                      type="number"
                      id="maxUses"
                      name="maxUses"
                      value={formData.maxUses || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Leave blank for unlimited uses"
                      min="1"
                    />
                  </div>

                  {/* Applicable Products */}
                  <div className="mb-4 md:col-span-2">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="applicableProducts">
                      Applicable Products (Optional)
                    </label>
                    <select
                      id="applicableProducts"
                      name="applicableProducts"
                      multiple
                      value={formData.applicableProducts}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 h-32"
                    >
                      <option value="">All Products</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-yellow-400/60 text-sm mt-1">Hold Ctrl/Cmd to select multiple products</p>
                  </div>

                  {/* Active Status */}
                  <div className="mb-4 md:col-span-2">
                    <label className="flex items-center text-yellow-100">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-yellow-500"
                      />
                      <span className="text-yellow-400 font-medium">Active Coupon</span>
                    </label>
                  </div>

                  {/* Description */}
                  <div className="mb-4 md:col-span-2">
                    <label className="block text-yellow-400 font-medium mb-2" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-blue-900/20 border border-yellow-500/30 rounded text-yellow-100 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      rows="3"
                      placeholder="Optional description for this coupon"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : editMode ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;