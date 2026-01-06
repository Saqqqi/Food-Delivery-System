import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Alert, Spinner, Button } from 'react-bootstrap';
import { FaStar, FaQuoteLeft, FaExclamationCircle } from 'react-icons/fa';
import './ReviewFeed.css';

const ReviewFeed = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ positivePercent: 0, criticalPercent: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, positive, critical
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get('http://localhost:3005/api/reviews/public');
            if (res.data.success) {
                setReviews(res.data.data);
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            setError('Unable to load reviews at the moment. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'positive') return r.sentiment === 'Positive';
        if (filter === 'critical') return r.sentiment === 'Critical' || r.sentiment === 'Neutral'; // Group neutral with others for now or separate
        return true;
    });

    return (
        <div className="review-feed-page">
            <div className="review-hero">
                <div className="container mx-auto">
                    <h1>Voice of Our Customers</h1>
                    <p>See what people are saying about their food experiences. Powered by AI Sentiment Analysis.</p>
                </div>
            </div>

            <div className="feed-controls">
                {/* Stats */}
                <div className="sentiment-stats">
                    <div className="stat-card">
                        <span className="stat-value positive">{stats.positivePercent}%</span>
                        <span className="stat-label">Positive Vibes</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="feed-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Reviews
                    </button>
                    <button
                        className={`filter-btn ${filter === 'positive' ? 'active' : ''}`}
                        onClick={() => setFilter('positive')}
                    >
                        Positive
                    </button>
                    <button
                        className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
                        onClick={() => setFilter('critical')}
                    >
                        Critical/Constructive
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Analyzing customer sentiments...</p>
                </div>
            ) : error ? (
                <Container className="my-5">
                    <Alert variant="danger" className="text-center">
                        <FaExclamationCircle size={24} className="mb-2" />
                        <h5>Oops! Something went wrong.</h5>
                        <p>{error}</p>
                        <Button variant="outline-danger" size="sm" onClick={fetchReviews}>
                            Try Again
                        </Button>
                    </Alert>
                </Container>
            ) : filteredReviews.length === 0 ? (
                <div className="text-center py-5">
                    <div className="bg-white p-5 rounded-lg shadow-sm d-inline-block">
                        <FaQuoteLeft size={40} className="text-gray-300 mb-3" />
                        <h4 className="text-gray-600">No reviews found</h4>
                        <p className="text-gray-400">Be the first to share your experience!</p>
                        <Button variant="warning" className="mt-2 text-white" onClick={() => setFilter('all')}>
                            View All Reviews
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="reviews-grid">
                    {filteredReviews.map(review => (
                        <div key={review._id} className="review-card">
                            <span className={`sentiment-badge ${review.sentiment.toLowerCase()}`}>
                                {review.sentiment}
                            </span>

                            {review.productId && (
                                <div className="product-info">
                                    <img
                                        src={`http://localhost:3005/${review.productId.image}`}
                                        alt={review.productId.name}
                                        className="product-thumb"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                    />
                                    <span className="product-name">{review.productId.name}</span>
                                </div>
                            )}

                            <div className="review-header">
                                <div className="reviewer-meta">
                                    <span className="reviewer-name">{review.userName || 'Anonymous'}</span>
                                    <span className="review-date">
                                        {new Date(review.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="review-rating">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} color={i < review.rating ? "#FBBF24" : "#E5E7EB"} />
                                    ))}
                                </div>
                            </div>

                            <div className="review-comment">
                                <FaQuoteLeft className="text-gray-300 mb-2" size={12} />
                                {review.comment}
                            </div>

                            {/* Topics & Highlights */}
                            <div className="review-tags mt-4 flex flex-wrap gap-2">
                                {review.topics && review.topics.map((topic, idx) => (
                                    <span key={idx} className="topic-tag bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-semibold border border-blue-100">
                                        #{topic}
                                    </span>
                                ))}
                                {review.highlights && review.highlights.map((word, idx) => (
                                    <span key={`hl-${idx}`} className="highlight-tag bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-semibold border border-green-100">
                                        ✨ {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewFeed;
