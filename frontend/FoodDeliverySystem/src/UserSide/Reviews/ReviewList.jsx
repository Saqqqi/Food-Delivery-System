import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Card, Badge, Row, Col } from 'react-bootstrap';
import { FaStar, FaStarHalfAlt, FaRegStar, FaComments, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const ReviewList = ({ show, handleClose, productId, productName, refreshTrigger }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.get(`http://localhost:3005/api/reviews/product/${productId}`);
            setReviews(response.data.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to load reviews. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (show && productId) {
            fetchReviews();
        }
    }, [show, productId, refreshTrigger, fetchReviews]);

    // Function to render stars based on rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const starSize = 14; // Smaller star size

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} className="text-warning" size={starSize} />);
        }

        // Add half star if needed
        if (hasHalfStar) {
            stars.push(<FaStarHalfAlt key="half" className="text-warning" size={starSize} />);
        }

        // Add empty stars
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" size={starSize} />);
        }

        return stars;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return 'Invalid date';
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            className="review-list-modal"
        >
            <Modal.Header
                closeButton
                className="border-0 pb-0"
                style={{
                    background: 'linear-gradient(135deg, #343a40 0%, #212529 100%)',
                    color: 'white',
                    borderBottom: 'none'
                }}
            >
                <Modal.Title className="w-100">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <FaComments className="text-warning me-2" size={22} />
                            <div>
                                <h5 className="mb-0 text-warning fw-bold" style={{ fontSize: '1.1rem', fontFamily: "'Poppins', sans-serif" }}>Reviews</h5>
                                <p className="mb-0 small text-light" style={{ fontSize: '0.8rem' }}>{productName}</p>
                            </div>
                        </div>
                        {reviews.length > 0 && (
                            <Badge
                                bg="warning"
                                text="dark"
                                className="px-2 py-1 rounded-pill fw-bold"
                                style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: '0.75rem' }}
                            >
                                {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                            </Badge>
                        )}
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="bg-dark text-light p-4" style={{ background: '#212529' }}>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        <span className="text-white">
                            {error}
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-white">Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '15px', padding: '30px' }}>
                        <div className="p-4">
                            <FaComments size={60} className="text-warning mb-4 opacity-75" />
                            <h5 className="text-warning fw-bold mb-2">No Reviews Yet</h5>
                            <p className="mb-4 text-white">Be the first to share your experience with this product!</p>
                            <Button
                                variant="outline-warning"
                                className="rounded-pill px-3 py-1 fw-bold"
                                onClick={handleClose}
                                style={{ borderColor: '#ffc107', color: '#ffc107', fontSize: '0.8rem', transition: 'all 0.3s ease' }}
                            >
                                Write a Review
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="review-list">
                        <Row>
                            <Col md={12} className="mb-4">
                                <div className="review-summary p-4 rounded-lg shadow-lg" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="text-warning mb-1" style={{ fontSize: '0.95rem', fontFamily: "'Poppins', sans-serif" }}>Customer Reviews</h5>
                                            <p className="text-white mb-0 small" style={{ fontSize: '0.75rem' }}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} for this product</p>
                                        </div>
                                        <div className="text-end">
                                            <div className="d-flex align-items-center">
                                                <div className="me-2">
                                                    <span className="text-warning mb-0" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                        {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                                                    </span>
                                                    <span className="text-white" style={{ fontSize: '0.8rem' }}> / 5</span>
                                                </div>
                                                <div className="d-flex">
                                                    {renderStars(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {reviews.map((review) => (
                            <Card
                                key={review._id}
                                className="mb-3 bg-dark text-light border-0 shadow-lg"
                                style={{ borderRadius: '15px', backgroundColor: '#2c3034', transition: 'transform 0.2s ease-in-out', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="user-avatar me-3">
                                                <FaUserCircle size={45} className="text-warning" />
                                            </div>
                                            <div>
                                                <h5 className="mb-0 text-warning fw-bold" style={{ fontSize: '0.9rem', fontFamily: "'Poppins', sans-serif" }}>{review.userName}</h5>
                                                <div className="d-flex align-items-center mt-1">
                                                    <FaCalendarAlt className="text-white me-2" size={12} />
                                                    <p className="text-white small mb-0" style={{ fontSize: '0.7rem' }}>{formatDate(review.date || review.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rating-badge p-1 rounded-pill" style={{ backgroundColor: 'rgba(255, 193, 7, 0.25)' }}>
                                            <div className="d-flex align-items-center">
                                                {renderStars(review.rating)}
                                                <span className="ms-1 text-warning fw-bold" style={{ fontSize: '0.75rem' }}>({review.rating})</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-content p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
                                        <p className="mb-0 text-white">{review.comment}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="bg-dark border-top border-secondary" style={{ background: '#212529', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <Button variant="secondary" onClick={handleClose} className="rounded-pill px-4 py-2">
                    <span className="text-white">Close</span>
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReviewList;