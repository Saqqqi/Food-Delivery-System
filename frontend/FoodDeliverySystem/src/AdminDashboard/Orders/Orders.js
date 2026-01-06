import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileDownload, FaSearch, FaFilter, FaTruck, FaStore, FaUser, FaDollarSign, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [restaurantAddresses, setRestaurantAddresses] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedStore, setSelectedStore] = useState("");
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationResponse, setCancellationResponse] = useState("approved");
  const [adminReason, setAdminReason] = useState("");
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [showDeliveryBoyModal, setShowDeliveryBoyModal] = useState(false);

  // Custom CSS for styling
  const styles = `
    .orders-container {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      margin: 20px;
      padding: 25px;
      border: 1px solid rgba(255, 193, 7, 0.2);
    }
    
    .orders-header {
      color: #ffc107;
      font-weight: 700;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(255, 193, 7, 0.3);
      text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .search-input, .filter-select {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 8px;
      padding: 10px 15px;
      transition: all 0.3s ease;
    }
    
    .search-input:focus, .filter-select:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
      background: rgba(255, 255, 255, 0.12);
      outline: none;
    }
    
    .search-input::placeholder {
      color: #718096;
    }
    
    .action-button {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      border: none;
      border-radius: 6px;
      padding: 8px 15px;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .action-button:hover {
      background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
    }
    
    .secondary-button {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      padding: 8px 15px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .secondary-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .table-container {
      background: rgba(26, 26, 46, 0.5);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 193, 7, 0.2);
      margin-bottom: 20px;
    }
    
    .custom-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }
    
    .custom-table thead {
      background: rgba(255, 193, 7, 0.15);
    }
    
    .custom-table th {
      color: #ffc107;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      border: none;
      padding: 15px;
      text-align: left;
    }
    
    .custom-table td {
      color: #ffffff;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 15px;
    }
    
    .custom-table tbody tr {
      background: rgba(10, 10, 26, 0.7);
    }
    
    .custom-table tbody tr:hover {
      background: rgba(255, 193, 7, 0.05);
    }
    
    .status-select {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 6px;
      padding: 6px 10px;
      transition: all 0.3s ease;
    }
    
    .status-select:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25);
      outline: none;
    }
    
    .expand-button {
      background: rgba(255, 193, 7, 0.1);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 50%;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .expand-button:hover {
      background: rgba(255, 193, 7, 0.2);
    }
    
    .expanded-content {
      background: rgba(26, 26, 46, 0.8);
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      border: 1px solid rgba(255, 193, 7, 0.1);
    }
    
    .pagination-button {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      border: none;
      border-radius: 6px;
      padding: 8px 15px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .pagination-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
      transform: translateY(-2px);
    }
    
    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .page-info {
      color: #a0aec0;
      font-weight: 500;
    }
    
    .modal-content {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 12px;
      color: #ffffff;
    }
    
    .modal-header {
      background: rgba(255, 193, 7, 0.1);
      border-bottom: 1px solid rgba(255, 193, 7, 0.2);
      padding: 20px;
      border-radius: 12px 12px 0 0;
    }
    
    .modal-title {
      color: #ffc107;
      font-weight: 700;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .modal-footer {
      background: rgba(255, 255, 255, 0.05);
      border-top: 1px solid rgba(255, 193, 7, 0.2);
      padding: 20px;
      border-radius: 0 0 12px 12px;
    }
    
    .form-label {
      color: #ffc107;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .form-control, .form-select, .form-textarea {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid rgba(255, 193, 7, 0.3);
      border-radius: 8px;
      padding: 12px 15px;
      transition: all 0.3s ease;
    }
    
    .form-control:focus, .form-select:focus, .form-textarea:focus {
      border-color: #ffc107;
      box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
      background: rgba(255, 255, 255, 0.12);
      outline: none;
    }
    
    .form-control::placeholder, .form-select::placeholder, .form-textarea::placeholder {
      color: #718096;
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .btn-warning {
      background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
      color: #1a1a2e;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 700;
      transition: all 0.3s ease;
    }
    
    .btn-warning:hover {
      background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
      transform: translateY(-2px);
    }
    
    .status-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .status-pending {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.3);
    }
    
    .status-shipped {
      background: rgba(56, 139, 253, 0.2);
      color: #388bfd;
      border: 1px solid rgba(56, 139, 253, 0.3);
    }
    
    .status-delivered {
      background: rgba(72, 187, 120, 0.2);
      color: #48bb78;
      border: 1px solid rgba(72, 187, 120, 0.3);
    }
    
    .status-cancellation-requested {
      background: rgba(245, 101, 101, 0.2);
      color: #f56565;
      border: 1px solid rgba(245, 101, 101, 0.3);
    }
    
    .status-cancelled {
      background: rgba(160, 174, 192, 0.2);
      color: #a0aec0;
      border: 1px solid rgba(160, 174, 192, 0.3);
    }
    
    .cancellation-link {
      color: #ffc107;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 500;
    }
    
    .cancellation-link:hover {
      color: #e0a800;
    }
  `;

  // Fetch orders, restaurant addresses, and delivery boys
  useEffect(() => {
    const adminKey = localStorage.getItem("food123");
    if (!adminKey) {
      console.error("Admin key (food123) not found in localStorage");
      alert("Please log in as an admin to view orders");
      return;
    }

    axios
      .get("http://localhost:3005/order/get-orders-list", {
        headers: { "admin-key": adminKey }
      })
      .then((res) => {
        console.log("Fetched data:", res.data);
        setOrders(res.data.orders);
        setRestaurantAddresses(res.data.restaurantAddresses);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        alert("Failed to fetch orders: " + (err.response?.data?.error || err.message));
      });
      
    // Fetch available delivery boys
    axios
      .get("http://localhost:3005/api/delivery/available", {
        headers: { "admin-key": adminKey }
      })
      .then((res) => {
        console.log("Fetched delivery boys:", res.data);
        setDeliveryBoys(res.data);
      })
      .catch((err) => {
        console.error("Error fetching delivery boys:", err);
        alert("Failed to fetch delivery boys: " + (err.response?.data?.error || err.message));
      });
  }, []);

  // Handle status update
  const handleStatusUpdate = async (orderId, status) => {
    if (status === "shipped") {
      setSelectedOrderId(orderId);
      // Refresh delivery boys list before showing the modal
      refreshDeliveryBoysList();
      setShowStoreModal(true);
      return;
    }

    try {
      const adminKey = localStorage.getItem("food123");
      await axios.put(
        `http://localhost:3005/order/update-status/${orderId}`,
        { status },
        { headers: { "admin-key": adminKey } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      alert("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status: " + (error.response?.data?.error || error.message));
    }
  };
  
  // Function to refresh the delivery boys list
  const refreshDeliveryBoysList = () => {
    const adminKey = localStorage.getItem("food123");
    axios
      .get("http://localhost:3005/api/delivery/available", {
        headers: { "admin-key": adminKey }
      })
      .then((res) => {
        console.log("Refreshed delivery boys list:", res.data);
        setDeliveryBoys(res.data);
      })
      .catch((err) => {
        console.error("Error refreshing delivery boys list:", err);
      });
  };

  // Handle store selection and status update for "shipped"
  const handleStoreSelection = async () => {
    if (!selectedStore) {
      alert("Please select a restaurant address");
      return;
    }

    // After selecting the store, show the delivery boy selection modal
    setShowStoreModal(false);
    setShowDeliveryBoyModal(true);
  };

  // Handle delivery boy selection and complete the shipping process
  const handleDeliveryBoySelection = async () => {
    if (!selectedDeliveryBoy) {
      alert("Please select a delivery boy");
      return;
    }

    try {
      const adminKey = localStorage.getItem("food123");
      // First update the order status to shipped with the restaurant address
      await axios.put(
        `http://localhost:3005/order/update-status/${selectedOrderId}`,
        { status: "shipped", restaurantAddressId: selectedStore },
        { headers: { "admin-key": adminKey } }
      );
      
      // Then assign the delivery boy to the order
      await axios.post(
        `http://localhost:3005/api/delivery/assign`,
        { orderId: selectedOrderId, deliveryBoyId: selectedDeliveryBoy },
        { headers: { "admin-key": adminKey } }
      );
      
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === selectedOrderId) {
            const selectedStoreData = restaurantAddresses.find(store => store.id === selectedStore);
            return {
              ...order,
              status: "shipped",
              restaurantAddress: {
                address: selectedStoreData.address,
                latitude: selectedStoreData.latitude,
                longitude: selectedStoreData.longitude,
                restaurantName: selectedStoreData.name
              },
              deliveryBoyId: selectedDeliveryBoy
            };
          }
          return order;
        })
      );
      
      alert("Order assigned to delivery boy and status updated successfully");
      setShowDeliveryBoyModal(false);
      setSelectedOrderId(null);
      setSelectedStore("");
      setSelectedDeliveryBoy("");
    } catch (error) {
      console.error("Error updating order status or assigning delivery boy:", error);
      alert("Failed to process order: " + (error.response?.data?.error || error.message));
    }
  };

  // Handle cancellation request
  const handleCancellationRequest = async () => {
    try {
      const adminKey = localStorage.getItem("food123");
      await axios.put(
        `http://localhost:3005/order/handle-cancellation/${selectedOrderId}`,
        { adminResponse: cancellationResponse, adminReason },
        { headers: { "admin-key": adminKey } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrderId
            ? {
                ...order,
                status: cancellationResponse === "approved" ? "cancelled" : "pending",
                cancellationReason: {
                  ...order.cancellationReason,
                  adminResponse: cancellationResponse,
                  adminReason
                }
              }
            : order
        )
      );
      alert("Cancellation request processed successfully");
      setShowCancellationModal(false);
      setSelectedOrderId(null);
      setCancellationResponse("approved");
      setAdminReason("");
    } catch (error) {
      console.error("Error processing cancellation request:", error);
      alert("Failed to process cancellation request: " + (error.response?.data?.error || error.message));
    }
  };

  const handleShow = (order) => {
    setSelectedOrderData(order);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  const handleShowCancellationModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancellationModal(true);
  };

  const handleCloseCancellationModal = () => {
    setShowCancellationModal(false);
    setSelectedOrderId(null);
    setCancellationResponse("approved");
    setAdminReason("");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Order ID: ${selectedOrderData._id?.slice(-6) || "Unknown"}`, 20, 40);
    doc.text(`Email: ${selectedOrderData.email || selectedOrderData.userId || "Unknown"}`, 20, 50);
    doc.text(
      `Total: $${selectedOrderData.totalAmount ? selectedOrderData.totalAmount.toFixed(2) : "0.00"}`,
      20,
      60
    );
    doc.text(`Status: ${selectedOrderData.status?.toUpperCase() || "Unknown"}`, 20, 70);
    doc.text(
      `Order Date: ${selectedOrderData.orderDate ? new Date(selectedOrderData.orderDate).toLocaleString() : "Unknown"}`,
      20,
      80
    );

    const tableColumn = ["Product Name", "Quantity", "Price", "Subtotal"];
    const tableRows = selectedOrderData.items
      ? selectedOrderData.items.map((item) => [
          item.name || "Unknown Product",
          item.quantity || 0,
          item.price ? `$${item.price.toFixed(2)}` : "$0.00",
          `$${(item.price * item.quantity).toFixed(2)}`
        ])
      : [];

    doc.autoTable({
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: "grid"
    });

    doc.text("Thank you for your order!", 105, doc.lastAutoTable.finalY + 10, { align: "center" });
    doc.save(`order_${selectedOrderData._id?.slice(-6) || "unknown"}.pdf`);
  };

  const handleToggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    if (filterOption === "city") {
      return (order.deliveryAddress?.city || "").toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (filterOption === "email") {
      return (order.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending": return "status-badge status-pending";
      case "shipped": return "status-badge status-shipped";
      case "delivered": return "status-badge status-delivered";
      case "cancellation_requested": return "status-badge status-cancellation-requested";
      case "cancelled": return "status-badge status-cancelled";
      default: return "status-badge status-pending";
    }
  };

  return (
    <div className="container my-5">
      <style>{styles}</style>
      
      <div className="orders-container">
        <h2 className="orders-header">
          <FaTruck />
          Orders List
        </h2>

        {/* Search and Filter */}
        <div className="mb-4 d-flex gap-3 flex-wrap">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text" style={{ background: 'rgba(255, 193, 7, 0.15)', color: '#ffc107', border: '1px solid rgba(255, 193, 7, 0.3)', borderRight: 'none', borderRadius: '8px 0 0 8px' }}>
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="filter-select"
          >
            <option value="">No Filter</option>
            <option value="city">City</option>
            <option value="email">Email</option>
          </select>
          
          <button 
            onClick={() => {
              console.log("All orders data:", orders);
              console.log("Restaurant addresses:", restaurantAddresses);
              alert("All orders and restaurant addresses data have been logged to the console");
            }}
            className="secondary-button"
          >
            Log Data
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Expand</th>
                <th>Order ID</th>
                <th>Email</th>
                <th>City</th>
                <th>Total</th>
                <th>Status</th>
                <th>Cancellation</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td>
                      <div 
                        className="expand-button"
                        onClick={() => handleToggleRow(order._id)}
                      >
                        {expandedRow === order._id ? '−' : '+'}
                      </div>
                    </td>
                    <td>{order._id?.slice(-6) || "Unknown"}</td>
                    <td>{order.email !== "Unknown" ? order.email : order.userId?.slice(-6) || "Unknown"}</td>
                    <td>{order.deliveryAddress?.city || "Unknown"}</td>
                    <td>${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</td>
                    <td>
                      <select
                        value={order.status || "pending"}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="status-select"
                      >
                        {["pending", "shipped", "delivered"].map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {order.status === "cancellation_requested" ? (
                        <span 
                          className="cancellation-link"
                          onClick={() => handleShowCancellationModal(order._id)}
                        >
                          Cancellation Requested
                        </span>
                      ) : order.cancellationReason?.adminResponse ? (
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.cancellationReason.adminResponse === "approved" ? "Cancelled" : "Cancellation Rejected"}
                        </span>
                      ) : (
                        <span>None</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="action-button"
                        onClick={() => handleShow(order)}
                        title="Download invoice"
                      >
                        <FaFileDownload />
                      </button>
                    </td>
                  </tr>

                  {expandedRow === order._id && (
                    <>
                      <tr>
                        <td colSpan="1"><b>Customer Address</b></td>
                        <td colSpan="7">
                          <p>
                            {order.deliveryAddress?.house_no || "Unknown"}, 
                            {order.deliveryAddress?.street || "Unknown"}, 
                            {order.deliveryAddress?.city || "Unknown"}, 
                            {order.deliveryAddress?.postcode || "Unknown"}
                          </p>
                        </td>
                      </tr>
                      {order.restaurantAddress && (
                        <tr>
                          <td colSpan="1"><b>Restaurant Address</b></td>
                          <td colSpan="7">
                            <p>
                              {order.restaurantAddress.restaurantName || "Unknown Restaurant"} - 
                              {order.restaurantAddress.address || "Unknown Address"}
                            </p>
                            <p>
                              Coordinates: {order.restaurantAddress.latitude?.toFixed(6)}, {order.restaurantAddress.longitude?.toFixed(6)}
                            </p>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="1"><b>Instructions</b></td>
                        <td colSpan="7"><p>{order.instructions || "None"}</p></td>
                      </tr>
                      <tr>
                        <td colSpan="1"><b>Payment Method</b></td>
                        <td colSpan="7"><p>{order.paymentMethod || "Unknown"}</p></td>
                      </tr>
                      <tr>
                        <td colSpan="1"><b>Order Date</b></td>
                        <td colSpan="7">
                          <p>{order.orderDate ? new Date(order.orderDate).toLocaleString() : "Unknown"}</p>
                        </td>
                      </tr>
                      {order.deliveryBoyId && (
                        <tr>
                          <td colSpan="1"><b>Delivery Boy</b></td>
                          <td colSpan="7">
                            <p>{typeof order.deliveryBoyId === 'object' ? 
                              `${order.deliveryBoyId.name || 'Unknown'} ${order.deliveryBoyId.phoneNumber ? `(${order.deliveryBoyId.phoneNumber})` : ''} ${order.deliveryBoyId.vehicleType ? `- ${order.deliveryBoyId.vehicleType}` : ''}` : 
                              order.deliveryBoyId}
                            </p>
                          </td>
                        </tr>
                      )}
                      {order.cancellationReason?.requestedReason && (
                        <tr>
                          <td colSpan="1"><b>Cancellation Request</b></td>
                          <td colSpan="7">
                            <p><b>Reason:</b> {order.cancellationReason.requestedReason}</p>
                            {order.cancellationReason.adminResponse && (
                              <p>
                                <b>Admin Response:</b> {order.cancellationReason.adminResponse.toUpperCase()}
                                {order.cancellationReason.adminReason && (
                                  <span> ({order.cancellationReason.adminReason})</span>
                                )}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan="8">
                          <div className="expanded-content">
                            <h4 className="mb-3" style={{ color: '#ffc107', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <FaStore /> Products Ordered:
                            </h4>
                            <table className="custom-table">
                              <thead>
                                <tr>
                                  <th>Product Name</th>
                                  <th>Quantity</th>
                                  <th>Price</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.name || "Unknown Product"}</td>
                                    <td>{item.quantity || 0}</td>
                                    <td>${item.price ? item.price.toFixed(2) : "0.00"}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                  </tr>
                                )) || (
                                  <tr>
                                    <td colSpan="4" className="text-center">
                                      No product details available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                              <tfoot>
                                <tr className="font-bold">
                                  <td colSpan="3" className="text-end">Total:</td>
                                  <td>${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between mt-4 px-3 pb-3">
          <button
            className="pagination-button"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {Math.ceil(filteredOrders.length / ordersPerPage)}
          </span>
          <button
            className="pagination-button"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastOrder >= filteredOrders.length}
          >
            Next
          </button>
        </div>
      </div>

      {/* Invoice Download Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <div className="modal-content">
          <Modal.Header closeButton>
            <Modal.Title>Download Invoice</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to download the invoice?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button
              variant="warning"
              onClick={() => {
                handleDownloadPDF();
                handleClose();
              }}
            >
              Download
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Store Selection Modal */}
      <Modal show={showStoreModal} onHide={() => setShowStoreModal(false)} centered>
        <div className="modal-content">
          <Modal.Header closeButton>
            <Modal.Title>Select Restaurant Address</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please select the restaurant address from which the order will be shipped:</p>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="form-select"
            >
              <option value="">Select a restaurant...</option>
              {restaurantAddresses.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.address})
                </option>
              ))}
            </select>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStoreModal(false)}>Cancel</Button>
            <Button
              variant="warning"
              onClick={handleStoreSelection}
            >
              Next
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Delivery Boy Selection Modal */}
      <Modal show={showDeliveryBoyModal} onHide={() => setShowDeliveryBoyModal(false)} centered>
        <div className="modal-content">
          <Modal.Header closeButton>
            <Modal.Title>Select Delivery Boy</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please select a delivery boy to assign this order:</p>
            <select
              value={selectedDeliveryBoy}
              onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
              className="form-select"
            >
              <option value="">Select a delivery boy...</option>
              {deliveryBoys.map((boy) => (
                <option key={boy._id} value={boy._id}>
                  {boy.name} ({boy.vehicleType || 'No vehicle'}) - {boy.phoneNumber || 'No phone'}
                </option>
              ))}
            </select>
            {deliveryBoys.length === 0 && (
              <p className="mt-2 text-danger">No available delivery boys found. Please try again later.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowDeliveryBoyModal(false);
              setShowStoreModal(true); // Go back to store selection
            }}>Back</Button>
            <Button
              variant="warning"
              onClick={handleDeliveryBoySelection}
              disabled={deliveryBoys.length === 0}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* Cancellation Request Modal */}
      <Modal show={showCancellationModal} onHide={handleCloseCancellationModal} centered>
        <div className="modal-content">
          <Modal.Header closeButton>
            <Modal.Title>Handle Cancellation Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><b>Order ID:</b> {selectedOrderId?.slice(-6) || "Unknown"}</p>
            <p><b>Cancellation Reason:</b> {orders.find(o => o._id === selectedOrderId)?.cancellationReason?.requestedReason || "No reason provided"}</p>
            <div className="mt-3">
              <label className="form-label">
                <FaFilter /> Response:
              </label>
              <select
                value={cancellationResponse}
                onChange={(e) => setCancellationResponse(e.target.value)}
                className="form-select"
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            <div className="mt-3">
              <label className="form-label">
                <FaUser /> Admin Reason (optional):
              </label>
              <textarea
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                className="form-textarea"
                rows="4"
                placeholder="Enter reason for approval/rejection..."
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseCancellationModal}>Cancel</Button>
            <Button
              variant="warning"
              onClick={handleCancellationRequest}
            >
              Submit
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </div>
  );
}