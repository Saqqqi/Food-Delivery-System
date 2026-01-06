import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash, FaFilter, FaSearch, FaSort, FaTimes, FaComment, FaBox, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../../ToastManager';

const Reviews = () => {
  const showToast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeProduct, setActiveProduct] = useState('all');
  const [activeRating, setActiveRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  // Custom CSS for styling
  const styles = `
    .reviews-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin: 20px;
      border: 1px solid rgba(255, 193, 7, 0.2);
    }
    
    .reviews-header {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      padding: 25px;
      border-radius: 12px 12px 0 0;
      position: relative;
      overflow: hidden;
    }
    
    .reviews-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.1);
    }
    
    .reviews-header-content {
      position: relative;
      z-index: 1;
    }
    
    .reviews-header h1 {
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .reviews-header p {
      font-weight: 500;
      opacity: 0.9;
    }
    
    .stats-card {
      background: rgba(26, 26, 46, 0.7);
      border: 1px solid rgba(255, 193, 7, 0.2);
      border-radius: 10px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    
    .stats-title {
      color: #ffc107;
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 0.9rem;
    }
    
    .stats-value {
      color: #ffffff;
      font-weight: 700;
      font-size: 1.8rem;
    }
    
    .filter-section {
      background: rgba(26, 26, 46, 0.5);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 193, 7, 0.1);
    }
    
    .filter-title {
      color: #ffc107;
      font-weight: 600;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .search-input {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 25px;
      padding: 12px 20px 12px 50px;
      transition: all 0.3s ease;
      width: 100%;
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
    
    .search-icon {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 193, 7, 0.7);
    }
    
    .clear-search {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.5);
      background: none;
      border: none;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    .clear-search:hover {
      color: #ffc107;
    }
    
    .filter-button {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .filter-button:hover {
      background: rgba(255, 193, 7, 0.1);
      transform: translateY(-2px);
    }
    
    .filter-button.active {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
    }
    
    .sort-button {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .sort-button:hover {
      background: rgba(255, 193, 7, 0.1);
      transform: translateY(-2px);
    }
    
    .sort-button.active {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      font-weight: 600;
      box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
    }
    
    .results-info {
      background: rgba(26, 26, 46, 0.7);
      border-radius: 10px;
      padding: 15px 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 193, 7, 0.1);
    }
    
    .results-text {
      color: #a0aec0;
      font-weight: 500;
    }
    
    .results-highlight {
      color: #ffc107;
      font-weight: 700;
    }
    
    .review-card {
      background: rgba(26, 26, 46, 0.7);
      border: 1px solid rgba(255, 193, 7, 0.2);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .review-card:hover {
      border-color: rgba(255, 193, 7, 0.4);
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    }
    
    .review-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .review-user {
      color: #ffc107;
      font-weight: 700;
      background: rgba(255, 193, 7, 0.15);
      padding: 6px 15px;
      border-radius: 20px;
      display: inline-block;
    }
    
    .review-date {
      color: #718096;
      font-size: 0.8rem;
      margin-top: 5px;
    }
    
    .delete-button {
      background: rgba(255, 255, 255, 0.1);
      color: #fc8181;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .delete-button:hover {
      background: rgba(220, 53, 69, 0.2);
      color: #ffffff;
    }
    
    .review-product {
      padding: 0 20px 10px;
    }
    
    .product-tag {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      margin-right: 8px;
    }
    
    .category-tag {
      background: rgba(255, 255, 255, 0.1);
      color: #a0aec0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .review-content {
      padding: 0 20px 20px;
    }
    
    .review-comment {
      background: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      font-style: italic;
      line-height: 1.6;
    }
    
    .no-reviews {
      background: rgba(26, 26, 46, 0.7);
      border: 1px solid rgba(255, 193, 7, 0.2);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    
    .no-reviews-icon {
      font-size: 3rem;
      color: #ffc107;
      margin-bottom: 20px;
    }
    
    .no-reviews-title {
      color: #ffc107;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .no-reviews-text {
      color: #a0aec0;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      color: #ffc107;
    }
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 193, 7, 0.3);
      border-top: 4px solid #ffc107;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .error-container {
      background: rgba(220, 53, 69, 0.15);
      border: 1px solid rgba(220, 53, 69, 0.3);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      max-width: 500px;
      margin: 50px auto;
    }
    
    .error-title {
      color: #fc8181;
      font-weight: 700;
      margin-bottom: 15px;
    }
    
    .error-text {
      color: #f56565;
      margin-bottom: 20px;
    }
    
    .retry-button {
      background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .retry-button:hover {
      background: linear-gradient(135deg, #bd2130 0%, #a71d2a 100%);
      transform: translateY(-2px);
    }
    
    .rating-distribution-bar {
      height: 100%;
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      border-radius: 2px;
      transition: all 0.5s ease;
    }
  `;

  // Fetch all reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const adminKey = localStorage.getItem('food123');
        const response = await axios.get('http://localhost:3005/api/reviews/all', {
          headers: { 'admin-key': adminKey },
        });
        setReviews(response.data.data);
        
        // Calculate stats
        const total = response.data.data.length;
        const average = total > 0 ? 
          (response.data.data.reduce((sum, review) => sum + review.rating, 0) / total) : 0;
        const distribution = [0, 0, 0, 0, 0];
        response.data.data.forEach(review => {
          distribution[review.rating - 1]++;
        });
        
        setStats({
          total,
          average,
          distribution
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch reviews');
        setLoading(false);
        showToast('Error', 'Failed to fetch reviews', 'danger');
      }
    };
    fetchReviews();
  }, []);

  // Delete a review
  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const adminKey = localStorage.getItem('food123');
        await axios.delete(`http://localhost:3005/api/reviews/${reviewId}`, {
          headers: { 'admin-key': adminKey },
          data: { userId: 'admin' },
        });
        setReviews(reviews.filter((review) => review._id !== reviewId));
        showToast('Success', 'Review deleted successfully', 'success');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete review');
        showToast('Error', 'Failed to delete review', 'danger');
      }
    }
  };

  // Group reviews by product
  const groupedReviews = reviews.reduce((acc, review) => {
    const productName = review.productId?.name || 'Unknown Product';
    if (!acc[productName]) acc[productName] = [];
    acc[productName].push(review);
    return acc;
  }, {});

  // Unique product names for filter
  const productNames = ['all', ...Object.keys(groupedReviews)];
  
  // Apply filters and sorting
  let filteredReviews = reviews;
  
  if (activeProduct !== 'all') {
    filteredReviews = groupedReviews[activeProduct] || [];
  }
  
  if (activeRating > 0) {
    filteredReviews = filteredReviews.filter(review => review.rating === activeRating);
  }
  
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filteredReviews = filteredReviews.filter(
      review => 
        review.userName.toLowerCase().includes(term) || 
        review.comment.toLowerCase().includes(term) ||
        (review.productId?.name && review.productId.name.toLowerCase().includes(term))
    );
  }
  
  filteredReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4">
        <style>{styles}</style>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="text-xl font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4">
        <style>{styles}</style>
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-text">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <style>{styles}</style>
      
      <div className="reviews-container">
        {/* Header Section */}
        <div className="reviews-header">
          <div className="reviews-header-content">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Customer Reviews
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Manage and analyze customer feedback
            </motion.p>
          </div>
        </div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stats-card">
            <div className="stats-title">Total Reviews</div>
            <div className="stats-value">{stats.total}</div>
          </div>
          <div className="stats-card">
            <div className="stats-title">Average Rating</div>
            <div className="flex items-center">
              <div className="stats-value mr-3">{stats.average.toFixed(1)}</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(stats.average) ? 'text-yellow-400' : 'text-yellow-400/30'}
                    size={18}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-title mb-3">Rating Distribution</div>
            <div className="space-y-2">
              {stats.distribution.map((count, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 text-sm text-yellow-300">{i+1}★</div>
                  <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden mx-2">
                    <div 
                      className="rating-distribution-bar"
                      style={{ width: `${(count / Math.max(...stats.distribution)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right text-sm text-yellow-300">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews by user, product or comment..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Filter */}
            <div className="filter-section">
              <div className="filter-title">
                <FaFilter />
                Filter by Product
              </div>
              <div className="flex flex-wrap gap-2">
                {productNames.map((product) => (
                  <motion.button
                    key={product}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`filter-button ${activeProduct === product ? 'active' : ''}`}
                    onClick={() => setActiveProduct(product)}
                  >
                    {product}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-section">
              <div className="filter-title">
                <FaStar />
                Filter by Rating
              </div>
              <div className="flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <motion.button
                    key={rating}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`filter-button flex items-center ${activeRating === rating ? 'active' : ''}`}
                    onClick={() => setActiveRating(activeRating === rating ? 0 : rating)}
                  >
                    {rating} <FaStar className="ml-1" size={12} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-section">
              <div className="filter-title">
                <FaSort />
                Sort By
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'highest', label: 'Highest' },
                  { value: 'lowest', label: 'Lowest' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`sort-button ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="px-6 pb-4">
          <div className="results-info">
            <div className="results-text">
              Showing <span className="results-highlight">{filteredReviews.length}</span> of <span className="results-highlight">{reviews.length}</span> reviews
              {activeProduct !== 'all' && (
                <span className="ml-2">
                  for <span className="results-highlight font-bold">{activeProduct}</span>
                </span>
              )}
              {activeRating > 0 && (
                <span className="ml-2">
                  with <span className="results-highlight font-bold">{activeRating} stars</span>
                </span>
              )}
            </div>
            {filteredReviews.length > 0 && (
              <div className="results-text mt-2">
                Average rating: 
                <span className="results-highlight font-bold ml-1">
                  {(filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length).toFixed(1)}
                </span>
                <div className="inline-flex ml-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length) ? 'text-yellow-400' : 'text-yellow-400/30'}
                      size={14}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-6 pt-0">
          {filteredReviews.length === 0 ? (
            <motion.div
              className="no-reviews"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="no-reviews-icon">☹️</div>
              <h3 className="no-reviews-title">No reviews found</h3>
              <p className="no-reviews-text">
                {searchTerm || activeProduct !== 'all' || activeRating > 0
                  ? "Try adjusting your filters or search term."
                  : "There are no reviews available yet."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredReviews.map((review) => (
                  <motion.div
                    key={review._id}
                    className="review-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className="review-header">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="review-user">{review.userName}</div>
                          <div className="review-date">
                            <FaCalendarAlt className="inline mr-2" size={12} />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="delete-button"
                          onClick={() => handleDelete(review._id)}
                          title="Delete Review"
                        >
                          <FaTrash size={16} />
                        </motion.button>
                      </div>
                      
                      <div className="flex mt-3">
                        <div className="flex mr-3">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < review.rating ? 'text-yellow-400' : 'text-yellow-400/30'}
                              size={16}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="review-product">
                      <span className="product-tag">
                        <FaBox className="inline mr-2" />
                        {review.productId?.name || 'Unknown Product'}
                      </span>
                      {review.productId?.category && (
                        <span className="category-tag">{review.productId.category}</span>
                      )}
                    </div>
                    
                    <div className="review-content">
                      <div className="review-comment">
                        <FaComment className="inline mr-2" />
                        "{review.comment}"
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;