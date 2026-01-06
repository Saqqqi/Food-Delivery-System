import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginSignUp from "./AdminDashboard/LoginSignUp/LoginSignUp.js";
import Dashboard from "./AdminDashboard/Dashboard/Dashboard.js";
import Home from "./UserSide/Home/Home.js";
import Footer from "./UserSide/footer.js";
import Navbar from "./UserSide/Navbar.js";
import "./App.css";
import CheckoutPage from "./UserSide/CheckOut/CheckOut.js";
import CompleteOrder from "./UserSide/CompleteOrder/CompleteOrder.js";
import OrderConfirmation from "./UserSide/OrderPlaced/OrderPlaced.js";
import NotFoundPage from "./UserSide/NotFoundPage.js";
import LoginRegister from "./UserSide/LoginSignUp/LoginSignup.js";
import ResetPassword from "./UserSide/LoginSignUp/ResetPassword.js";
import Profile from "./UserSide/Profile/Profile.js";

import OrderMap from "./UserSide/OrderMap.jsx";
import TableReservation from "./UserSide/TableReservation/TableReservation.js";
import Support from "./UserSide/Support/Support.js";
import ReviewFeed from "./UserSide/ReviewFeed/ReviewFeed.js";

// Dashboard Selector Component
import DashboardSelector from "./DashboardSelector/DashboardSelector.js";

// Delivery Boy Components
import DeliveryBoyLoginSignup from "./DeliveryBoy/LoginSignUp/LoginSignup.js";
import DeliveryBoyDashboard from "./DeliveryBoy/Dashboard/Dashboard.js";
import RedeemPoints from "./DeliveryBoy/RedeemPoints/RedeemPoints.js";
import OrderHistory from "./DeliveryBoy/OrderHistory/OrderHistory.js";

// Admin User Management
import UserManagement from "./AdminDashboard/UserManagement/UserManagement.js";

const AppRouter = () => {
    const location = useLocation();

    // Now we also restrict Navbar and Footer for the homepage ("/")
    const isRestrictedRoute = location.pathname === "/" || location.pathname.startsWith("/admin") || location.pathname.startsWith("/userDashboard") || location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/delivery");

    // Authentication tokens for different user types
    const admintoken = localStorage.getItem("food123");
    const deliveryBoyToken = localStorage.getItem("deliveryBoyToken");
    const userToken = localStorage.getItem("FoodCustomerToken"); // User authentication token - used to protect user routes

    return (
        <>
            {/* Only show Navbar and Footer on non-restricted routes */}
            {!isRestrictedRoute && <Navbar />}

            <Routes>
                <Route path="/" exact element={<DashboardSelector />} />
                <Route path="/login" exact element={<LoginRegister />} />
                <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
                <Route path="/admin/login" exact element={<LoginSignUp />} />
                <Route path="/delivery/login" exact element={<DeliveryBoyLoginSignup />} />

                {/* Protected User Routes - Redirect to login if not authenticated */}
                <Route path="/home" exact element={userToken ? <Home /> : <Navigate to="/login" />} />
                <Route path="/checkout" exact element={userToken ? <CheckoutPage /> : <Navigate to="/login" />} />
                <Route path="/completeorder" exact element={userToken ? <CompleteOrder /> : <Navigate to="/login" />} />
                <Route path="/orderconfirm" exact element={userToken ? <OrderConfirmation /> : <Navigate to="/login" />} />
                <Route path="/order-tracking" exact element={userToken ? <OrderMap /> : <Navigate to="/login" />} />
                <Route path="/table-reservation" exact element={userToken ? <TableReservation /> : <Navigate to="/login" />} />
                <Route path="/profile" exact element={userToken ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/support" exact element={userToken ? <Support /> : <Navigate to="/login" />} />
                <Route path="/reviews" exact element={userToken ? <ReviewFeed /> : <Navigate to="/login" />} />

                {/* Delivery Boy Routes */}
                <Route
                    path="/delivery/dashboard"
                    exact
                    element={deliveryBoyToken ? <DeliveryBoyDashboard /> : <Navigate to="/delivery/login" />}
                />
                <Route
                    path="/delivery/redeem-points"
                    exact
                    element={deliveryBoyToken ? <RedeemPoints /> : <Navigate to="/delivery/login" />}
                />
                <Route
                    path="/delivery/order-history"
                    exact
                    element={deliveryBoyToken ? <OrderHistory /> : <Navigate to="/delivery/login" />}
                />

                <Route
                    path="/admin/dashboard"
                    exact
                    element={admintoken ? <Dashboard /> : <Navigate to="/admin/login" />}
                />
                <Route
                    path="/admin/users"
                    exact
                    element={admintoken ? <UserManagement /> : <Navigate to="/admin/login" />}
                />

                {/* Add the NotFoundPage for undefined routes */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Only show Footer on non-restricted routes */}
            {!isRestrictedRoute && <Footer />}
        </>
    );
};

export default AppRouter;