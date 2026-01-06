import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LoyaltyPoints = () => {
  const [loading, setLoading] = useState(false);
  const [loyaltyRules, setLoyaltyRules] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pointsPerAmount: 1,
    orderAmountThreshold: 100,
    redemptionRate: 0.1,
    minPointsToRedeem: 100,
    isActive: true,
    description: 'Loyalty points program'
  });

  // Fetch loyalty rules on component mount
  useEffect(() => {
    fetchLoyaltyRules();
  }, []);

  const fetchLoyaltyRules = async () => {
    try {
      setLoading(true);
      const adminKey = localStorage.getItem('food123');
      if (!adminKey) {
        toast.error('Admin authentication required');
        return;
      }
      
      const response = await axios.get('/loyalty/settings', {
        baseURL: 'http://localhost:3005',
        headers: { 'admin-key': adminKey }
      });
      if (response.data.status === 'success') {
        setLoyaltyRules(response.data.data.loyaltyRules);
        // Update form data with current rules
        setFormData(response.data.data.loyaltyRules);
      }
    } catch (error) {
      console.error('Error fetching loyalty rules:', error);
      toast.error('Failed to fetch loyalty rules');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const adminKey = localStorage.getItem('food123');
      if (!adminKey) {
        toast.error('Admin authentication required');
        return;
      }
      
      const response = await axios.post('/loyalty-points/settings', formData, {
        baseURL: 'http://localhost:3005',
        headers: { 'admin-key': adminKey }
      });
      if (response.data.status === 'success') {
        setLoyaltyRules(response.data.data.loyaltyRules);
        setShowModal(false);
        toast.success('Loyalty points settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating loyalty rules:', error);
      toast.error('Failed to update loyalty rules');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Loyalty Points Management</h2>
        <button
          onClick={handleOpenModal}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
        >
          {loyaltyRules ? 'Edit Settings' : 'Set Up Loyalty Program'}
        </button>
      </div>

      {loading && !loyaltyRules ? (
        <div className="text-center py-4">Loading loyalty program settings...</div>
      ) : !loyaltyRules ? (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <FaInfoCircle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Loyalty Program Set Up</h3>
          <p className="text-gray-600 mb-4">
            You haven't configured your loyalty points program yet. Click the button above to set it up.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Current Loyalty Program Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Points Earning</h4>
              <p className="text-gray-600">
                <span className="font-bold text-yellow-600">{loyaltyRules.pointsPerAmount}</span> point(s) earned for every
                <span className="font-bold text-yellow-600"> ₹{loyaltyRules.orderAmountThreshold}</span> spent
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Example: A ₹{loyaltyRules.orderAmountThreshold * 5} order would earn {loyaltyRules.pointsPerAmount * 5} points
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Points Redemption</h4>
              <p className="text-gray-600">
                <span className="font-bold text-yellow-600">₹{loyaltyRules.redemptionRate}</span> discount per point when redeemed
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Example: {loyaltyRules.minPointsToRedeem} points can be redeemed for ₹{(loyaltyRules.minPointsToRedeem * loyaltyRules.redemptionRate).toFixed(2)} discount
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Minimum Redemption</h4>
              <p className="text-gray-600">
                Minimum <span className="font-bold text-yellow-600">{loyaltyRules.minPointsToRedeem}</span> points required to redeem
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">Program Status</h4>
              <p className="text-gray-600">
                Status: <span className={`font-bold ${loyaltyRules.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {loyaltyRules.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">{loyaltyRules.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {loyaltyRules ? 'Edit Loyalty Program Settings' : 'Set Up Loyalty Program'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Points Per Amount */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="pointsPerAmount">
                    Points Per Amount*
                  </label>
                  <input
                    type="number"
                    id="pointsPerAmount"
                    name="pointsPerAmount"
                    value={formData.pointsPerAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-yellow-500"
                    min="0"
                    step="1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Number of points earned per threshold amount</p>
                </div>
                
                {/* Order Amount Threshold */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="orderAmountThreshold">
                    Order Amount Threshold (₹)*
                  </label>
                  <input
                    type="number"
                    id="orderAmountThreshold"
                    name="orderAmountThreshold"
                    value={formData.orderAmountThreshold}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-yellow-500"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Amount spent to earn points (e.g., ₹100 = 1 point)</p>
                </div>
                
                {/* Redemption Rate */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="redemptionRate">
                    Redemption Rate (₹ per point)*
                  </label>
                  <input
                    type="number"
                    id="redemptionRate"
                    name="redemptionRate"
                    value={formData.redemptionRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-yellow-500"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Value of each point when redeemed (e.g., ₹0.1 per point)</p>
                </div>
                
                {/* Minimum Points to Redeem */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="minPointsToRedeem">
                    Minimum Points to Redeem*
                  </label>
                  <input
                    type="number"
                    id="minPointsToRedeem"
                    name="minPointsToRedeem"
                    value={formData.minPointsToRedeem}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-yellow-500"
                    min="1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum points required for redemption</p>
                </div>
                
                {/* Active Status */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Program Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="isActive">
                      Active
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Enable or disable the loyalty program</p>
                </div>
                
                {/* Description */}
                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                    Program Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-yellow-500"
                    rows="3"
                    placeholder="Description of your loyalty program"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loyalty Points Usage Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Loyalty Points Usage Guide</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">How Points Are Earned</h4>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Points are automatically added to customer accounts after order completion</li>
                <li>Points are calculated based on the order total amount</li>
                <li>The system uses the threshold and rate settings you configure</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium text-gray-700 mb-2">How Points Are Redeemed</h4>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>Customers can redeem points during checkout</li>
                <li>Redemption applies a discount to their order</li>
                <li>Customers must have the minimum required points to redeem</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints;