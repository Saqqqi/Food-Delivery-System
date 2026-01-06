import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiShoppingBag, FiUser, FiHome, FiCalendar, FiHeart, FiInfo, FiPhone, FiHelpCircle, FiStar } from 'react-icons/fi';
import { RiCoupon3Line } from 'react-icons/ri';
import { IoFastFoodOutline } from 'react-icons/io5';
import logo from "../Assets/logo.jpg";
import './Navbar.css';

const Navbar = () => {
  const [isSideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const location = useLocation();
  const sideDrawerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Set active tab based on current path
    const path = location.pathname;
    if (path.includes('/home')) setActiveBottomTab('home');
    else if (path.includes('/completeorder')) setActiveBottomTab('orders');
    else if (path.includes('/table-reservation')) setActiveBottomTab('reservations');
    else if (path.includes('/cart')) setActiveBottomTab('cart');
    else if (path.includes('/profile')) setActiveBottomTab('profile');

    window.addEventListener("scroll", handleScroll);

    // Close side drawer when clicking outside
    const handleClickOutside = (event) => {
      if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target)) {
        setSideDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname]);

  const toggleSideDrawer = () => {
    setSideDrawerOpen(!isSideDrawerOpen);
  };

  const navLinks = [
    { path: "/home", name: "Menu", icon: <IoFastFoodOutline />, bottomNavId: 'home' },
    { path: "/completeorder", name: "Orders", icon: <FiShoppingBag />, bottomNavId: 'orders' },
    { path: "/table-reservation", name: "Reservations", icon: <FiCalendar />, bottomNavId: 'reservations' },
    { path: "/reviews", name: "Reviews", icon: <FiStar />, bottomNavId: 'reviews' },
    { path: "/support", name: "Support", icon: <FiHelpCircle />, bottomNavId: 'support' },
    { path: "/cart", name: "Cart", icon: <FiShoppingBag />, bottomNavId: 'cart' },
    { path: "/profile", name: "Profile", icon: <FiUser />, bottomNavId: 'profile' }
  ];

  const drawerLinks = [
    { path: "/home", name: "Home", icon: <FiHome /> },
    { path: "/menu", name: "Menu", icon: <IoFastFoodOutline /> },
    { path: "/completeorder", name: "My Orders", icon: <FiShoppingBag /> },
    { path: "/table-reservation", name: "Table Reservations", icon: <FiCalendar /> },
    { path: "/reviews", name: "Customer Reviews", icon: <FiStar /> },
    { path: "/favorites", name: "Favorites", icon: <FiHeart /> },
    { path: "/coupons", name: "Coupons & Offers", icon: <RiCoupon3Line /> },
    { path: "/support", name: "Support", icon: <FiHelpCircle /> },
    { path: "/about", name: "About Us", icon: <FiInfo /> },
    { path: "/contact", name: "Contact Us", icon: <FiPhone /> }
  ];

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`navbar-container ${isScrolled ? "navbar-solid" : "navbar-glass"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Menu Button */}
            <button
              onClick={toggleSideDrawer}
              className="mobile-menu-button text-white hover:text-yellow-400 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <FiMenu size={24} />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="brand-logo flex items-center space-x-2"
            >
              <img
                src={logo}
                alt="Foodie Fly Logo"
                className="h-10 w-10 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
              />
              <span className="brand-text text-xl font-bold hidden sm:inline-block text-white">
                Foodie<span className="text-yellow-400">Fly</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="desktop-menu">
              {navLinks.slice(0, 5).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-item px-3 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 ${location.pathname === link.path
                    ? "bg-yellow-400 text-gray-900 font-bold shadow-md"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.name}
                </Link>
              ))}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="nav-item ml-2 p-2 rounded-full bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-all duration-200 relative shadow-md"
                aria-label="Shopping cart"
              >
                <FiShoppingBag size={18} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
              </Link>

              {/* User/Auth Button */}
              <Link
                to="/profile"
                className="nav-item ml-2 p-2 rounded-full bg-black text-yellow-400 hover:bg-gray-900 hover:text-yellow-300 transition-all duration-200 shadow-md"
                aria-label="User account"
              >
                <FiUser size={18} />
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Side Drawer */}
      <AnimatePresence>
        {isSideDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSideDrawer}
            />

            {/* Drawer */}
            <motion.div
              ref={sideDrawerRef}
              className="side-drawer bg-gray-900"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="drawer-header bg-gradient-to-r from-yellow-500 to-yellow-600">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setSideDrawerOpen(false)}>
                  <img
                    src={logo}
                    alt="Foodie Fly Logo"
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                  <span className="text-xl font-bold text-white">
                    Foodie<span className="text-gray-900">Fly</span>
                  </span>
                </Link>
                <button
                  onClick={toggleSideDrawer}
                  className="drawer-close-btn text-white hover:text-gray-900 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="drawer-content">
                {drawerLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSideDrawerOpen(false)}
                    className={`drawer-nav-item text-white hover:bg-gray-800 hover:text-yellow-400 transition-all duration-200 ${location.pathname === link.path ? "bg-gray-800 text-yellow-400 border-l-4 border-yellow-400" : ""
                      }`}
                  >
                    <span className="mr-3 text-yellow-400">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}

                <div className="drawer-divider border-t border-gray-700 my-2"></div>

                <Link
                  to="/login"
                  className="drawer-nav-item text-white hover:bg-gray-800 hover:text-yellow-400 transition-all duration-200"
                  onClick={() => setSideDrawerOpen(false)}
                >
                  <FiUser className="mr-3 text-yellow-400" />
                  Sign In / Register
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <motion.div
        className="bottom-nav md:hidden bg-gray-900 border-t border-gray-700"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`bottom-nav-item flex flex-col items-center justify-center py-2 transition-all duration-200 ${activeBottomTab === link.bottomNavId
              ? "text-yellow-400 bg-gray-800"
              : "text-gray-300 hover:text-white"
              }`}
          >
            <span className="text-xl mb-1">{link.icon}</span>
            <span className="text-xs font-medium">{link.name}</span>
          </Link>
        ))}
      </motion.div>

      {/* Spacer to account for fixed navbar */}
      <div className="h-16 md:h-20"></div>

      {/* Spacer for bottom navigation on mobile */}
      <div className="h-16 md:h-0 block md:hidden"></div>
    </>
  );
};

export default Navbar;