import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaUtensils, FaFilter } from 'react-icons/fa';

// Custom CSS for styling
const styles = `
  .extra-items-container {
    background-color: #1a1a2e;
    color: #fff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .extra-items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #eab308;
    padding-bottom: 1rem;
  }

  .extra-items-title {
    font-size: 1.8rem;
    font-weight: bold;
    color: #eab308;
    display: flex;
    align-items: center;
  }

  .add-item-btn {
    background-color: #eab308;
    color: #1a1a2e;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }

  .add-item-btn:hover {
    background-color: #fde047;
    transform: translateY(-2px);
  }

  .filter-container {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    background-color: #16213e;
    padding: 0.75rem;
    border-radius: 5px;
  }

  .filter-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 1rem;
    color: #eab308;
    font-weight: bold;
  }

  .filter-select {
    background-color: #1a1a2e;
    color: white;
    border: 1px solid #eab308;
    padding: 0.5rem;
    border-radius: 5px;
    min-width: 200px;
  }

  .form-container {
    background-color: #16213e;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border-left: 4px solid #eab308;
  }

  .form-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    color: #eab308;
    border-bottom: 1px solid #eab308;
    padding-bottom: 0.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .span-full {
    grid-column: 1 / -1;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    color: #fde047;
    font-weight: 500;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 0.75rem;
    background-color: #1a1a2e;
    border: 1px solid #eab308;
    border-radius: 5px;
    color: white;
    transition: all 0.3s ease;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: #fde047;
    box-shadow: 0 0 0 2px rgba(253, 224, 71, 0.25);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-checkbox {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: #eab308;
  }

  .checkbox-label {
    color: #fde047;
    font-weight: 500;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .cancel-btn {
    background-color: #475569;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-btn:hover {
    background-color: #64748b;
  }

  .submit-btn {
    background-color: #eab308;
    color: #1a1a2e;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .submit-btn:hover {
    background-color: #fde047;
  }

  .table-container {
    background-color: #16213e;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .table-responsive {
    overflow-x: auto;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
  }

  .items-table th {
    background-color: #1a1a2e;
    color: #eab308;
    text-align: left;
    padding: 1rem;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.875rem;
  }

  .items-table td {
    padding: 1rem;
    border-bottom: 1px solid #2a2a5a;
    color: white;
  }

  .items-table tr:hover {
    background-color: rgba(26, 26, 46, 0.7);
  }

  .item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .item-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eab308;
  }

  .item-name {
    font-weight: bold;
    color: white;
    margin-bottom: 0.25rem;
  }

  .item-description {
    font-size: 0.875rem;
    color: #94a3b8;
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .category-badge {
    background-color: #0f172a;
    color: #eab308;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: bold;
    border: 1px solid #eab308;
  }

  .price-cell {
    font-weight: bold;
    color: #fde047;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: bold;
    display: inline-flex;
  }

  .status-available {
    background-color: rgba(22, 163, 74, 0.2);
    color: #4ade80;
    border: 1px solid #4ade80;
  }

  .status-unavailable {
    background-color: rgba(220, 38, 38, 0.2);
    color: #f87171;
    border: 1px solid #f87171;
  }

  .actions-cell {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn, .delete-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    border-radius: 5px;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .edit-btn {
    background-color: #1e40af;
    color: white;
  }

  .edit-btn:hover {
    background-color: #2563eb;
  }

  .delete-btn {
    background-color: #991b1b;
    color: white;
  }

  .delete-btn:hover {
    background-color: #dc2626;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  .loader {
    border: 4px solid rgba(234, 179, 8, 0.3);
    border-radius: 50%;
    border-top: 4px solid #eab308;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-container {
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 5px;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .edit-btn {
    background-color: #1e40af;
    color: white;
    margin-right: 0.5rem;
  }

  .edit-btn:hover {
    background-color: #2563eb;
  }

  .delete-btn {
    background-color: #991b1b;
    color: white;
  }

  .delete-btn:hover {
    background-color: #dc2626;
  }

  .form-btn {
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .table-header {
    background-color: #1a1a2e;
  }

  .table-row:nth-child(even) {
    background-color: rgba(22, 33, 62, 0.7);
  }

  .table-row:hover {
    background-color: rgba(26, 26, 46, 0.9);
  }

  .extra-items-container {
    background-color: #212529;
    color: #FFF;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .extra-items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #eab308;
    padding-bottom: 15px;
  }
  .extra-items-title {
    font-size: 24px;
    font-weight: 700;
    color: #eab308;
  }
  .add-item-btn {
    background-color: #eab308;
    color: #000;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .add-item-btn:hover {
    background-color: #fde047;
    transform: translateY(-2px);
  }
  .form-container {
    background-color: #2d3748;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #eab308;
  }
  .form-title {
    color: #eab308;
    font-size: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #4a5568;
    padding-bottom: 10px;
  }
  .form-input {
    background-color: #1a202c;
    color: #fff;
    border: 1px solid #4a5568;
    border-radius: 6px;
    padding: 10px;
    transition: all 0.3s ease;
  }
  .form-input:focus {
    border-color: #eab308;
    box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.25);
  }
  .form-label {
    color: #e2e8f0;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .form-select {
    background-color: #1a202c;
    color: #fff;
    border: 1px solid #4a5568;
    border-radius: 6px;
  }
  .form-btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .cancel-btn {
    background-color: #4a5568;
    color: #fff;
  }
  .cancel-btn:hover {
    background-color: #2d3748;
  }
  .submit-btn {
    background-color: #eab308;
    color: #000;
  }
  .submit-btn:hover {
    background-color: #fde047;
  }
  .table-container {
    background-color: #2d3748;
    border-radius: 10px;
    overflow: hidden;
  }
  .table-header {
    background-color: #1a202c;
  }
  .table-header th {
    color: #eab308;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .table-row {
    transition: all 0.3s ease;
  }
  .table-row:hover {
    background-color: #4a5568;
  }
  .item-name {
    font-weight: 600;
    color: #fff;
  }
  .item-description {
    color: #a0aec0;
    font-size: 14px;
  }
  .category-badge {
    background-color: #3182ce;
    color: #fff;
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .status-badge {
    padding: 4px 8px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .status-available {
    background-color: rgba(72, 187, 120, 0.2);
    color: #48bb78;
  }
  .status-unavailable {
    background-color: rgba(245, 101, 101, 0.2);
    color: #f56565;
  }
  .action-btn {
    background: transparent;
    border: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  .edit-btn {
    color: #4299e1;
  }
  .edit-btn:hover {
    background-color: rgba(66, 153, 225, 0.1);
  }
  .delete-btn {
    color: #f56565;
  }
  .delete-btn:hover {
    background-color: rgba(245, 101, 101, 0.1);
  }
  .item-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eab308;
  }
  .filter-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .filter-select {
    background-color: #1a202c;
    color: #fff;
    border: 1px solid #4a5568;
    border-radius: 6px;
    padding: 8px 12px;
    min-width: 150px;
  }
  .filter-label {
    color: #e2e8f0;
    font-weight: 600;
  }
`;

const ExtraItems = () => {
  const [extraItems, setExtraItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'other',
    description: '',
    image: '',
    isAvailable: true
  });
  const [editMode, setEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Categories for dropdown
  const categories = [
    { value: 'drink', label: 'Drink' },
    { value: 'salad', label: 'Salad' },
    { value: 'fries', label: 'Fries' },
    { value: 'sauce', label: 'Sauce' },
    { value: 'side', label: 'Side Dish' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch all extra items
  const fetchExtraItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('food123');
      console.log('Fetching extra items from:', `${process.env.REACT_APP_API_URL}/api/extra-items`);
      console.log('Using admin-key:', 'food123');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/extra-items`, {
        headers: { 'admin-key': 'food123' }
      });
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Extra items:', response.data.data?.extraItems);
      
      setExtraItems(response.data.data?.extraItems || []);
    } catch (error) {
      console.error('Error fetching extra items:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to load extra items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('ExtraItems component mounted');
    console.log('Environment API URL:', process.env.REACT_APP_API_URL);
    console.log('Current extraItems state:', extraItems);
    fetchExtraItems();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const headers = { 'admin-key': 'food123' };

      if (editMode) {
        // Update existing item
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/api/extra-items/${currentItemId}`,
          formData,
          { headers }
        );
        toast.success('Extra item updated successfully');
      } else {
        // Create new item
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/extra-items`,
          formData,
          { headers }
        );
        toast.success('Extra item added successfully');
      }

      // Reset form and fetch updated list
      resetForm();
      fetchExtraItems();
    } catch (error) {
      console.error('Error saving extra item:', error);
      toast.error(error.response?.data?.message || 'Failed to save extra item');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      image: item.image || '',
      isAvailable: item.isAvailable
    });
    setCurrentItemId(item._id);
    setEditMode(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/extra-items/${id}`, {
          headers: { 'admin-key': 'food123' }
        });
        toast.success('Extra item deleted successfully');
        fetchExtraItems();
      } catch (error) {
        console.error('Error deleting extra item:', error);
        toast.error('Failed to delete extra item');
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'other',
      description: '',
      image: '',
      isAvailable: true
    });
    setEditMode(false);
    setCurrentItemId(null);
    setShowForm(false);
  };

  // Add the style tag to the component
  useEffect(() => {
    // Add the styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    // Cleanup function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Add state for filtering
  const [filterCategory, setFilterCategory] = useState('all');

  // Filter items based on category
  const filteredItems = filterCategory === 'all' 
    ? extraItems 
    : extraItems.filter(item => item.category === filterCategory);

  return (
    <div className="extra-items-container">
      <div className="extra-items-header">
        <h1 className="extra-items-title">
          <FaUtensils style={{ display: 'inline', marginRight: '10px' }} /> Extra Items Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="add-item-btn"
        >
          {showForm ? 'Cancel' : <><FaPlus /> Add New Item</>}
        </button>
      </div>

      {/* Filter by category */}
      <div className="filter-container">
        <span className="filter-label"><FaFilter /> Filter:</span>
        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="form-container">
          <h2 className="form-title">
            {editMode ? 'Edit Extra Item' : 'Add New Extra Item'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="form-label" htmlFor="name">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="price">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="image">
                  Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="mb-4 md:col-span-2">
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isAvailable" className="form-label">Available for customers</label>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="form-btn cancel-btn mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="form-btn submit-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : editMode ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      No extra items found. {extraItems.length > 0 ? 'Try a different filter.' : 'Add your first item!'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="item-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50?text=Food';
                              }}
                            />
                          )}
                          <div>
                            <div className="item-name">{item.name}</div>
                            {item.description && (
                              <div className="item-description truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="category-badge">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`status-badge ${item.isAvailable ? 'status-available' : 'status-unavailable'}`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(item)}
                          className="action-btn edit-btn"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="action-btn delete-btn"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraItems;