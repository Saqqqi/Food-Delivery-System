import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashBoardNavbar.css";

export default function DashBoardNavbar({ onItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Handle outside clicks to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set active tab based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) setActiveBottomTab("dashboard");
    else if (path.includes("/products")) setActiveBottomTab("products");
    else if (path.includes("/orders")) setActiveBottomTab("orders");
    else if (path.includes("/categories")) setActiveBottomTab("categories");
    else if (path.includes("/coupons")) setActiveBottomTab("coupons");
  }, [location.pathname]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("food123");
    navigate("/admin/login");
  };

  const handleItemClick = (item) => {
    setActiveItem(item);
    setActiveBottomTab(item);
    onItemClick(item);
    if (window.innerWidth < 768) {
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  // Define navigation items
  const navItems = [
    { name: "dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
    { name: "addproducts", icon: "fa-plus-square", label: "Add Product" },
    { name: "products", icon: "fa-box", label: "Products List" },
    { name: "extra-items", icon: "fa-utensils", label: "Extra Items" },
    { name: "orders", icon: "fa-clipboard-list", label: "Orders List" },
    { name: "categories", icon: "fa-tags", label: "Categories" },
    { name: "coupons", icon: "fa-ticket-alt", label: "Coupons" },
    { name: "loyalty-points", icon: "fa-award", label: "Loyalty Points" },
    { name: "table-reservations", icon: "fa-calendar-alt", label: "Table Reservations" },
    { name: "reviews", icon: "fa-comments", label: "Reviews" },
    { name: "food-delivery-addresses", icon: "fa-map-marker-alt", label: "Food Delivery Addresses" },
    { name: "live-chat", icon: "fa-comment-dots", label: "Live Chat" },
    { name: "reports", icon: "fa-chart-line", label: "Revenue & Analytics" } // Add this line
  ];

  // Bottom navigation items (limited to 5 for mobile)
  const bottomNavItems = [
    { name: "dashboard", icon: "fa-tachometer-alt", label: "Dashboard" },
    { name: "products", icon: "fa-box", label: "Products" },
    { name: "extra-items", icon: "fa-utensils", label: "Extras" },
    { name: "orders", icon: "fa-clipboard-list", label: "Orders" },
    { name: "categories", icon: "fa-tags", label: "Categories" }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="menu-toggle-btn"
        onClick={handleToggle}
        aria-label="Toggle menu"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
      ></div>

      {/* Admin Sidebar */}
      <div
        ref={sidebarRef}
        className={`admin-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <i className="fas fa-utensils"></i>
            </div>
            <span className="admin-logo-text">FoodieAdmin</span>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            className="close-sidebar-btn md:hidden"
            onClick={handleToggle}
            aria-label="Close menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Collapse Button (Desktop Only) */}
        <div
          className="collapse-btn hidden md:flex"
          onClick={toggleCollapse}
          aria-label="Collapse sidebar"
        >
          <i className="fas fa-chevron-left"></i>
        </div>

        <div className="nav-items">
          {navItems.map((item) => (
            <div
              key={item.name}
              className={`nav-item ${activeItem === item.name ? 'active' : ''}`}
              onClick={() => handleItemClick(item.name)}
            >
              <i className={`fas ${item.icon}`}></i>
              <span className="nav-item-text">{item.label}</span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="tooltip">{item.label}</div>
              )}
            </div>
          ))}

          <div className="nav-divider"></div>

          <div
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="nav-item-text">Logout</span>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="tooltip">Logout</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="bottom-nav">
        {bottomNavItems.map((item) => (
          <div
            key={item.name}
            className={`bottom-nav-item ${activeBottomTab === item.name ? 'active' : ''}`}
            onClick={() => handleItemClick(item.name)}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}