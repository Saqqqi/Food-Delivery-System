import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPinterest, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { BiRestaurant } from 'react-icons/bi';
import { GiHotMeal } from 'react-icons/gi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Column */}
          <div className="space-y-6">
            <div className="flex items-center">
              <GiHotMeal className="text-yellow-400 text-3xl mr-2" />
              <span className="text-2xl font-bold text-yellow-400">FoodieFly</span>
            </div>
            <p className="text-gray-400">
              Delivering delicious meals straight to your door. Fresh ingredients, authentic flavors, and exceptional service.
            </p>
            <div className="flex space-x-4">
              <a href="/" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="/" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="/" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="/" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <FaYoutube size={20} />
              </a>
              <a href="/" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <FaPinterest size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-6 pb-2 border-b border-yellow-400 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center">
                  <BiRestaurant className="mr-2" /> Our Menu
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Special Offers
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-6 pb-2 border-b border-yellow-400 inline-block">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-yellow-400 mt-1 mr-3" />
                <span className="text-gray-400">123 Food Street, Culinary City, FC 12345</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-yellow-400 mr-3" />
                <span className="text-gray-400">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-yellow-400 mr-3" />
                <span className="text-gray-400">hello@foodiefly.com</span>
              </li>
              <li className="flex items-center">
                <FaClock className="text-yellow-400 mr-3" />
                <span className="text-gray-400">Open: 9:00 AM - 11:00 PM Daily</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-6 pb-2 border-b border-yellow-400 inline-block">
              Newsletter
            </h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new dishes and exclusive offers!
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-white"
                required
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col items-center">
          <h4 className="text-gray-400 mb-4">We Accept</h4>
          <div className="flex space-x-4">
            <div className="bg-white p-2 rounded-md">
              <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6" />
            </div>
            <div className="bg-white p-2 rounded-md">
              <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-6" />
            </div>
            <div className="bg-white p-2 rounded-md">
              <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="American Express" className="h-6" />
            </div>
            <div className="bg-white p-2 rounded-md">
              <img src="https://cdn-icons-png.flaticon.com/512/825/825454.png" alt="PayPal" className="h-6" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-4">
            <span>© {new Date().getFullYear()} FoodieFly. All rights reserved.</span>
            <span className="hidden md:block">|</span>
            <div className="flex space-x-4">
              <Link to="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-yellow-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;