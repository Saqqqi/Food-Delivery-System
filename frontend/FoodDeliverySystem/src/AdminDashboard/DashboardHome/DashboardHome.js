import React, { useState } from 'react';
import { FaPlus, FaList, FaTags, FaClipboardList, FaStar, FaUsers, FaChartBar, FaCog } from 'react-icons/fa';
import { motion } from 'framer-motion';

const DashboardHome = ({ onItemClick }) => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleItemClick = (item) => {
    setActiveItem(item);
    onItemClick(item);
  };

  // Stats cards data
  const statsData = [
    { title: "Total Orders", value: "1,245", icon: <FaClipboardList />, color: "bg-blue-500" },
    { title: "Total Products", value: "342", icon: <FaList />, color: "bg-green-500" },
    { title: "Total Users", value: "1,876", icon: <FaUsers />, color: "bg-yellow-500" },
    { title: "Pending Reviews", value: "24", icon: <FaStar />, color: "bg-purple-500" }
  ];

  // Quick actions data
  const quickActions = [
    { icon: <FaPlus className="text-2xl" />, label: "Add Product", name: "addproducts", startColor: "#3b82f6", endColor: "#1d4ed8" },
    { icon: <FaList className="text-2xl" />, label: "Product List", name: "products", startColor: "#10b981", endColor: "#047857" },
    { icon: <FaTags className="text-2xl" />, label: "Categories", name: "categories", startColor: "#f59e0b", endColor: "#b45309" },
    { icon: <FaClipboardList className="text-2xl" />, label: "Order List", name: "orders", startColor: "#ef4444", endColor: "#b91c1c" },
    { icon: <FaStar className="text-2xl" />, label: "Review List", name: "reviews", startColor: "#8b5cf6", endColor: "#6d28d9" },
    { icon: <FaChartBar className="text-2xl" />, label: "Reports", name: "reports", startColor: "#6366f1", endColor: "#4338ca" },
    { icon: <FaUsers className="text-2xl" />, label: "Customers", name: "customers", startColor: "#ec4899", endColor: "#be185d" },
    { icon: <FaCog className="text-2xl" />, label: "Settings", name: "settings", startColor: "#6b7280", endColor: "#374151" }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: '#181539' }}>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="mb-8 text-center py-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#ffc107' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            Welcome Back, Admin!
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: '#a0aec0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Manage your platform with ease and control. Here's what's happening today.
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              className="rounded-2xl p-6 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(255, 193, 7, 0.2)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold" style={{ color: '#ffc107' }}>{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          className="rounded-2xl p-6 shadow-lg mb-8"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255, 193, 7, 0.2)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffc107' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${action.startColor} 0%, ${action.endColor} 100%)`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (action.name !== "settings") {
                    handleItemClick(action.name);
                  }
                }}
              >
                <div className="text-white mb-2">
                  {action.icon}
                </div>
                <span className="text-white text-sm font-medium">{action.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="rounded-2xl p-6 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255, 193, 7, 0.2)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffc107' }}>Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center p-3 rounded-lg hover:bg-black/20 transition-colors">
                <div className="bg-gray-700 rounded-full p-2 mr-4">
                  <FaClipboardList className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Order #ORD-00{item} has been placed</h3>
                  <p className="text-gray-400 text-sm">2 hours ago</p>
                </div>
                <div className="text-gray-400 text-sm">View</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardHome;