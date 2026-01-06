import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Modal,
  Button,
  Collapse,
  Form,
} from 'react-bootstrap';
import { FaEdit, FaTrash, FaSearch, FaBox, FaTags, FaUtensils, FaDollarSign, FaCube, FaImage } from 'react-icons/fa';
import { GLTFModel, OBJModel } from 'react-3d-viewer';

const API_BASE_URL = 'http://localhost:3005';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState([]);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products`);
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setLoading(false);
      }
    };

    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/restaurant-delivery-addresses`);
        setRestaurants(res.data);
      } catch (err) {
        console.error('Fetch restaurants error:', err);
      }
    };

    fetchProducts();
    fetchRestaurants();
  }, []);

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = (product) => {
    setProductData(product);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'restaurant') {
      const restaurantName = e.target.options[e.target.selectedIndex].text;
      setProductData({
        ...productData,
        restaurant: {
          id: value,
          name: restaurantName
        }
      });
    } else if (name === 'image' || name === 'model3d') {
      if (files && files[0]) {
        setProductData({ ...productData, [name]: files[0] });
      }
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      formData.append('description', productData.description);

      // Handle restaurant
      if (productData.restaurant) {
        if (typeof productData.restaurant === 'object') {
          formData.append('restaurant', productData.restaurant.id || 'our');
          formData.append('restaurantName', productData.restaurant.name || 'Our Restaurant');
        } else {
          formData.append('restaurant', productData.restaurant);
        }
      }

      // Handle File Uploads (only append if it's a File object)
      if (productData.image instanceof File) {
        formData.append('image', productData.image);
      }
      if (productData.model3d instanceof File) {
        formData.append('model3d', productData.model3d);
      } else if (productData.model3d && typeof productData.model3d === 'string') {
        // Keeping existing model string is not needed for backend usually unless we want to retain it explicitly, 
        // but backend usually keeps old if new not provided. However, ensuring we don't send string if backend expects file.
        // Actually, backend only checks req.files. So we simply don't append 'model3d' if it's not a new file.
      }

      const res = await axios.put(`${API_BASE_URL}/products/${productData._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updated = products.map((p) =>
        p._id === productData._id ? res.data : p
      );
      setProducts(updated);
      handleCloseEditModal();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleRowToggle = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const maxPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / maxPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * maxPerPage,
    page * maxPerPage
  );

  // Custom CSS for styling
  const styles = `
    /* Modal Styles Scoped */
    .edit-product-modal {
      z-index: 10500 !important; /* Ensure it is on top of everything */
    }
    
    .edit-product-modal .modal-content {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
      border: 1px solid rgba(255, 193, 7, 0.3) !important;
      border-radius: 12px;
      color: #ffffff;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
    }

    .edit-product-modal .modal-header {
      border-bottom: 1px solid rgba(255, 193, 7, 0.2);
    }

    .edit-product-modal .modal-footer {
      border-top: 1px solid rgba(255, 193, 7, 0.2);
    }
    
    .edit-product-modal .btn-close {
        filter: invert(1) grayscale(100%) brightness(200%); /* Make close button white */
    }

    /* Modal Backdrop Fix if needed */
    .modal-backdrop {
        z-index: 10400 !important;
    }

    /* Ensure inputs in modal are visible/clickable */
    .edit-product-modal .form-control, 
    .edit-product-modal .form-select {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #fff !important;
        border: 1px solid rgba(255, 193, 7, 0.3) !important;
        z-index: auto; /* Prevent z-index issues on inputs */
    }

    .edit-product-modal .form-control:focus, 
    .edit-product-modal .form-select:focus {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: #ffc107 !important;
        box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25) !important;
    }
    
    /* Global Product Container Styles */
    .products-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin: 20px;
      padding: 25px;
      border: 1px solid rgba(255, 193, 7, 0.2);
    }
    
    .products-header {
      color: #ffc107;
      font-weight: 700;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(255, 193, 7, 0.3);
      text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .search-input {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 8px;
      padding: 10px 15px;
      transition: all 0.3s ease;
    }
    
    .search-input:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
      background: rgba(255, 255, 255, 0.12);
      outline: none;
    }
    
    .search-input::placeholder {
      color: #718096;
    }
    
    .table-container {
      background: rgba(26, 26, 46, 0.5);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 193, 7, 0.2);
      margin-bottom: 20px;
    }
    
    .custom-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    .custom-table thead {
      background: rgba(255, 193, 7, 0.15);
    }
    
    .custom-table th {
      color: #ffc107;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      border: none;
      padding: 15px;
      text-align: left;
    }
    
    .custom-table td {
      color: #ffffff;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 15px;
    }
    
    .custom-table tbody tr {
      background: rgba(10, 10, 26, 0.7);
    }
    
    .custom-table tbody tr:hover {
      background: rgba(255, 193, 7, 0.05);
    }
    
    .action-button {
      background: rgba(255, 255, 255, 0.1);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 6px;
      padding: 6px 10px;
      margin: 0 3px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-button:hover {
      background: rgba(255, 193, 7, 0.1);
      transform: translateY(-2px);
    }
    
    .pagination-button {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      border: none;
      border-radius: 6px;
      padding: 8px 15px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .pagination-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
      transform: translateY(-2px);
    }
    
    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .page-info {
      color: #a0aec0;
      font-weight: 500;
    }
    
    .expand-button {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 50%;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .expand-button:hover {
      background: rgba(255, 193, 7, 0.2);
    }
    
    .expanded-content {
      background: rgba(26, 26, 46, 0.8);
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      border: 1px solid rgba(255, 193, 7, 0.1);
    }
    
    .form-label {
      color: #ffc107;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .btn-warning {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 700;
      transition: all 0.3s ease;
    }
    
    .btn-warning:hover {
      background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
      transform: translateY(-2px);
    }
  `;

  if (loading) return <div className='text-center text-warning'>Loading...</div>;

  return (
    <div className='container my-5'>
      <style>{styles}</style>

      <div className='products-container'>
        <div className='row mb-4'>
          <div className='col-md-8'>
            <h2 className='products-header'>
              <FaBox />
              Food Items List
            </h2>
          </div>
          <div className='col-md-4'>
            <div className='input-group'>
              <span className='input-group-text' style={{ background: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', border: '1px solid rgba(255, 193, 7, 0.3)', borderRight: 'none', borderRadius: '8px 0 0 8px' }}>
                <FaSearch />
              </span>
              <input
                type='text'
                className='search-input'
                placeholder='Search food items...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className='table-container'>
          <table className='custom-table'>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Expand</th>
                <th>Name</th>
                <th>Category</th>
                <th>Restaurant</th>
                <th>Price</th>
                <th className='text-end'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <React.Fragment key={product._id}>
                  <tr>
                    <td>
                      <div
                        className='expand-button'
                        onClick={() => handleRowToggle(product._id)}
                      >
                        {expandedRows.includes(product._id) ? '−' : '+'}
                      </div>
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaTags style={{ color: '#ffc107', fontSize: '0.8rem' }} />
                        {product.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaUtensils style={{ color: '#ffc107', fontSize: '0.8rem' }} />
                        {product.restaurant?.name || 'Our Restaurant'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaDollarSign style={{ color: '#ffc107', fontSize: '0.8rem' }} />
                        {product.price}
                      </span>
                    </td>
                    <td className='text-end'>
                      <button
                        className='action-button'
                        onClick={() => handleShowEditModal(product)}
                        title='Edit product'
                      >
                        <FaEdit />
                      </button>
                      <button
                        className='action-button'
                        onClick={() => handleDelete(product._id)}
                        title='Delete product'
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                  {expandedRows.includes(product._id) && (
                    <tr>
                      <td colSpan={6}>
                        <div className='expanded-content'>
                          <p><strong>Description:</strong> {product.description || 'No description provided'}</p>
                          <p><strong>Restaurant:</strong> {product.restaurant?.name || 'Our Restaurant'}</p>
                          {product.image && (
                            <div className="mb-3">
                              <h6>Image Preview:</h6>
                              <img
                                src={`${API_BASE_URL} /${product.image.replace(/\\/g, '/')}`}
                                alt={product.name}
                                className='img-fluid rounded'
                                style={{ maxWidth: '200px', border: '1px solid rgba(255, 193, 7, 0.3)' }
                                }
                              />
                            </div >
                          )}

                          {
                            product.model3d && (
                              <div className="mt-3">
                                <h6>3D Model Preview:</h6>
                                <div style={{ width: '300px', height: '300px', border: '1px solid #ffc107', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                                  {/* Simple extension check */}
                                  {product.model3d.toLowerCase().endsWith('.obj') ? (
                                    <OBJModel
                                      src={`${API_BASE_URL}/${product.model3d.replace(/\\/g, '/')}`}
                                      width="300" height="300"
                                      position={{ x: 0, y: -1, z: 0 }}
                                    />
                                  ) : (
                                    <GLTFModel
                                      src={`${API_BASE_URL}/${product.model3d.replace(/\\/g, '/')}`}
                                      width="300" height="300"
                                    />
                                  )}
                                </div>
                              </div>
                            )
                          }
                        </div >
                      </td >
                    </tr >
                  )}
                </React.Fragment >
              ))}
            </tbody >
          </table >

          {/* Pagination */}
          < div className='d-flex justify-content-between align-items-center mt-4 px-3 pb-3' >
            <button
              className='pagination-button'
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className='page-info'>
              Page {page} of {totalPages}
            </span>
            <button
              className='pagination-button'
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div >
        </div >
      </div >

      {/* Edit Modal */}
      < Modal show={showEditModal} onHide={handleCloseEditModal} centered className="edit-product-modal" >
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                name='name'
                value={productData.name || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Restaurant</Form.Label>
              <Form.Select
                name='restaurant'
                value={productData.restaurant?.id || 'our'}
                onChange={handleInputChange}
              >
                <option value='our'>Our Restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.restaurantName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type='text'
                name='category'
                value={productData.category || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                name='price'
                value={productData.price || ''}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                name='description'
                value={productData.description || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Update Image</Form.Label>
              <Form.Control
                type='file'
                name='image'
                accept="image/*"
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Update 3D Model</Form.Label>
              <Form.Control
                type='file'
                name='model3d'
                accept=".glb,.obj,.gltf"
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant='warning' onClick={handleUpdate}>
            Update
          </Button>
        </Modal.Footer>
      </Modal >
    </div >
  );
}