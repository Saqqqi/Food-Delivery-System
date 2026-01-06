import React, { useState, useEffect } from "react";
import slide1 from "../../Assets/cover.jpg";
import slide2 from "../../Assets/2.jpg"; // Add more images
import slide3 from "../../Assets/3.jpg";
import CategoryProducts from "../CategoryProducts";
import { motion } from 'framer-motion';
import ChatBot from "../ChatBot";
import { FiArrowRight } from 'react-icons/fi';
import { AuthProvider } from "../../context/AuthContext";
import ErrorBoundary from "../../components/ErrorBoundary";

const FirstSection = () => {
    const images = [slide1, slide2, slide3]; // Multiple slides
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotate slides
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Slide animation variants
    const slideVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 1.5 } },
        exit: { opacity: 0, transition: { duration: 1 } }
    };

    return (
        <div className="relative w-full overflow-hidden" style={{ height: "85vh" }}>
            {/* Animated background slides */}
            <motion.div
                key={currentIndex}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${images[currentIndex]})`,
                }}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 z-0" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-4xl"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 60, delay: 0.2 }}
                >
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-yellow-400 mb-6"
                        style={{
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            fontFamily: "'Poppins', sans-serif",
                            letterSpacing: '1px'
                        }}
                    >
                        FOODIE <span className="text-white">FLY</span>
                    </motion.h1>

                    <motion.p
                        className="mt-4 text-xl md:text-3xl text-white font-medium"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                    >
                        Delivering happiness to your doorstep
                    </motion.p>

                    <motion.div
                        className="mt-12 flex flex-col sm:flex-row gap-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <a
                            href="#categories"
                            className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            style={{ minWidth: '200px' }}
                        >
                            Explore Menu <FiArrowRight className="ml-2" />
                        </a>
                        <a
                            href="/reviews"
                            className="inline-flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/50 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            style={{ minWidth: '200px' }}
                        >
                            Customer Voices
                        </a>
                    </motion.div>
                </motion.div>

                {/* Slide indicators */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-yellow-400 w-6' : 'bg-white/50'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const Home = () => {
    return (
        <div className="bg-gray-50">
            <FirstSection />
            <div id="categories" className="py-16">
                <CategoryProducts />
            </div>
            <AuthProvider>
                <ErrorBoundary>
                    <ChatBot />
                </ErrorBoundary>
            </AuthProvider>
        </div>
    );
};

export default Home;