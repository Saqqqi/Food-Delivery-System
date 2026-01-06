import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './DashboardSelector.css';
import adminIcon from '../Assets/images/adminside.PNG';
import userIcon from '../Assets/images/userside.PNG';
import deliveryIcon from '../Assets/images/cart-1.jpg';

const DashboardSelector = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3
      }
    }
  };

  const handleAdminClick = () => {
    navigate('/admin/login');
  };

  const handleUserClick = () => {
    navigate('/home');
  };

  const handleDeliveryClick = () => {
    navigate('/delivery/login');
  };

  return (
    <motion.div 
      className="dashboard-selector-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-selector-header">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="title"
        >
          Welcome to <span>FoodieFly</span>
        </motion.h1>
        <motion.p
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Select your dashboard to continue
        </motion.p>
      </div>
      
      <motion.div 
        className="dashboard-boxes"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="dashboard-box admin-box"
          onClick={handleAdminClick}
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="box-icon">
            <img src={adminIcon} alt="Admin" />
          </div>
          <h2>Admin Dashboard</h2>
          <p>Manage products, orders, and users</p>
          <div className="box-overlay"></div>
        </motion.div>

        <motion.div 
          className="dashboard-box user-box"
          onClick={handleUserClick}
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="box-icon">
            <img src={userIcon} alt="User" />
          </div>
          <h2>User Dashboard</h2>
          <p>Browse products and place orders</p>
          <div className="box-overlay"></div>
        </motion.div>

        <motion.div 
          className="dashboard-box delivery-box"
          onClick={handleDeliveryClick}
          variants={itemVariants}
          whileHover="hover"
        >
          <div className="box-icon">
            <img src={deliveryIcon} alt="Delivery" />
          </div>
          <h2>Delivery Dashboard</h2>
          <p>Manage deliveries and track orders</p>
          <div className="box-overlay"></div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardSelector;