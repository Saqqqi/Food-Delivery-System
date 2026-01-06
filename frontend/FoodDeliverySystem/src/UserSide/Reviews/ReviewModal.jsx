import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaStar, FaRegStar, FaEdit, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ReviewModal = ({ show, handleClose, productId, productName, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (show && productId) {
            // Reset form when modal opens
            setRating(0);
            setHoveredRating(0);
            setComment('');
            setError('');
            setSuccess(false);
            
            // Get user info
            getUserInfo();
        }
    }, [show, productId]);

    const getUserInfo = () => {
        try {
            const token = localStorage.getItem("FoodCustomerToken");
            if (!token) {
                setError('Please login to add a review');
                return;
            }
            
            const decoded = jwtDecode(token);
            const userIdFromToken = decoded.id || decoded._id;
            
            // Try to get userName from localStorage
            const userDataStr = localStorage.getItem("FoodCustomerUser");
            let userNameFromStorage = '';
            
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    userNameFromStorage = userData.name || userData.userName || decoded.name || 'User';
                } catch (e) {
                    userNameFromStorage = decoded.name || 'User';
                }
            } else {
                userNameFromStorage = decoded.name || 'User';
            }
            
            setUserId(userIdFromToken);
            setUserName(userNameFromStorage);
        } catch (e) {
            console.error("Error getting user info:", e);
            setError('Please login to add a review');
        }
    };

    const handleStarClick = (value) => {
        setRating(value);
    };

    const handleStarHover = (value) => {
        setHoveredRating(value);
    };

    const handleStarLeave = () => {
        setHoveredRating(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!userId) {
            setError('Please login to add a review');
            return;
        }

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a comment');
            return;
        }

        if (comment.trim().length > 500) {
            setError('Comment cannot be more than 500 characters');
            return;
        }

        try {
            setLoading(true);
            
            const token = localStorage.getItem("FoodCustomerToken");
            const response = await axios.post(
                'http://localhost:3005/api/reviews',
                {
                    productId,
                    userId,
                    userName,
                    rating,
                    comment: comment.trim()
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess(true);
                setRating(0);
                setComment('');
                
                // Call callback to refresh reviews
                if (onReviewAdded) {
                    setTimeout(() => {
                        onReviewAdded();
                        handleClose();
                    }, 1500);
                } else {
                    setTimeout(() => {
                        handleClose();
                    }, 1500);
                }
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                setError(err.response.data.errors[0]?.msg || 'Failed to submit review');
            } else {
                setError('Failed to submit review. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        const displayRating = hoveredRating || rating;
        
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => handleStarHover(i)}
                    onMouseLeave={handleStarLeave}
                    style={{
                        cursor: 'pointer',
                        fontSize: '2rem',
                        marginRight: '5px',
                        transition: 'all 0.2s ease',
                        color: i <= displayRating ? '#FFD700' : '#6c757d'
                    }}
                >
                    {i <= displayRating ? (
                        <FaStar className="text-warning" />
                    ) : (
                        <FaRegStar className="text-secondary" />
                    )}
                </span>
            );
        }
        return stars;
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose}
            centered
            size="lg"
            className="review-modal"
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            <Modal.Header 
                closeButton 
                className="border-0 pb-2"
                style={{ 
                    background: 'linear-gradient(135deg, #2E1E13 0%, #4A3526 100%)',
                    color: 'white',
                    borderBottom: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Decorative elements */}
                <div 
                    style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 80,
                        height: 80,
                        background: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: '50%',
                        zIndex: 0
                    }}
                />
                <div 
                    style={{
                        position: 'absolute',
                        bottom: -20,
                        left: -20,
                        width: 60,
                        height: 60,
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '50%',
                        zIndex: 0
                    }}
                />
                
                <Modal.Title className="w-100 position-relative" style={{ zIndex: 1 }}>
                    <div className="d-flex align-items-center">
                        <div 
                            style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                borderRadius: '12px',
                                padding: '8px',
                                marginRight: '12px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <FaEdit className="text-white" size={20} />
                        </div>
                        <div>
                            <h5 className="mb-0 text-white fw-bold" style={{ fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                Write a Review
                            </h5>
                            <p className="mb-0 text-warning" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                                {productName}
                            </p>
                        </div>
                    </div>
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body 
                className="p-4"
                style={{ 
                    background: 'linear-gradient(135deg, #2E1E13 0%, #3D2A1E 50%, #2E1E13 100%)',
                    color: '#FFFFFF',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background pattern */}
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                            radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255, 165, 0, 0.03) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(255, 193, 7, 0.02) 0%, transparent 50%)
                        `,
                        zIndex: 0
                    }}
                />
                
                <Form onSubmit={handleSubmit} className="position-relative" style={{ zIndex: 1 }}>
                    {error && (
                        <Alert 
                            variant="danger" 
                            className="border-0 rounded-lg shadow-lg mb-4"
                            style={{ 
                                background: 'rgba(220, 53, 69, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white'
                            }}
                            onClose={() => setError('')}
                            dismissible
                        >
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert 
                            variant="success" 
                            className="border-0 rounded-lg shadow-lg mb-4"
                            style={{ 
                                background: 'rgba(40, 167, 69, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white'
                            }}
                        >
                            <strong>Success!</strong> Your review has been submitted successfully!
                        </Alert>
                    )}

                    {/* Rating Section */}
                    <div className="mb-4">
                        <Form.Label className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
                            Your Rating <span className="text-warning">*</span>
                        </Form.Label>
                        <div 
                            className="d-flex align-items-center p-4 rounded-lg"
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 193, 7, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="d-flex align-items-center me-3">
                                {renderStars()}
                            </div>
                            {rating > 0 && (
                                <span className="text-warning fw-bold ms-3" style={{ fontSize: '1.1rem' }}>
                                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="mb-4">
                        <Form.Label className="text-white fw-bold mb-3" style={{ fontSize: '1rem' }}>
                            Your Review <span className="text-warning">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="border-0 rounded-lg"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                color: 'white',
                                fontSize: '0.95rem',
                                resize: 'none',
                                backdropFilter: 'blur(10px)'
                            }}
                            maxLength={500}
                        />
                        <div className="d-flex justify-content-between mt-2">
                            <small className="text-warning" style={{ fontSize: '0.8rem' }}>
                                * Required fields
                            </small>
                            <small className="text-white" style={{ fontSize: '0.8rem' }}>
                                {comment.length}/500 characters
                            </small>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="d-flex justify-content-end gap-3 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-pill px-4 py-2 fw-bold"
                            style={{
                                background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                                border: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <FaTimes className="me-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || rating === 0 || !comment.trim()}
                            className="rounded-pill px-4 py-2 fw-bold"
                            style={{
                                background: loading || rating === 0 || !comment.trim()
                                    ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
                                    : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                border: 'none',
                                color: loading || rating === 0 || !comment.trim() ? '#ccc' : '#2E1E13',
                                transition: 'all 0.3s ease',
                                boxShadow: loading || rating === 0 || !comment.trim()
                                    ? 'none'
                                    : '0 4px 15px rgba(255, 193, 7, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && rating > 0 && comment.trim()) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && rating > 0 && comment.trim()) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.4)';
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <FaEdit className="me-2" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;
