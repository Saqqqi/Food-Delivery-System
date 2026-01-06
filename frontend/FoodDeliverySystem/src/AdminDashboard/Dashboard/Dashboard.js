import React, { useEffect, useState } from 'react';
import DashBoardNavbar from '../DashboardNavbar/DashboardNavbar';
import AddProducts from '../AddProducts/AddProducts.js';
import Orders from '../Orders/Orders.js';
import Products from '../Products/Products.js';
import Customers from '../Customers/Customers.js';
import DashboardHome from '../DashboardHome/DashboardHome.js';
import TableReservations from '../TableReservations/TableReservations.js';
import Reviews from '../Reviews/Reviews.js';
import FoodDeliveryAddress from '../FoodDeliveryAddress/FoodDeliveryAddress.js';
import Categories from '../Categories.js';
import Coupons from '../Coupons/Coupons.js';
import LoyaltyPoints from '../LoyaltyPoints/LoyaltyPoints.js';
import ExtraItems from '../ExtraItems/ExtraItems.js';
import LiveChat from '../LiveChat/LiveChat.js';
import Revenue from '../Revenue/Revenue.js';

export default function Dashboard() {
    const [selectedComponent, setSelectedComponent] = useState('dashboard');

    const handleMenuItemClick = (item) => {
        setSelectedComponent(item);
    };

    return (
        <div className="container-fluid m-0 p-0" style={{ backgroundColor: '#181539', minHeight: '100vh' }}>
            <div className="row m-0" style={{ minHeight: '100vh' }}>
                <div className="col-lg-2 col-md-3 p-0">
                    <DashBoardNavbar onItemClick={handleMenuItemClick} />
                </div>
                <div className="col-lg-10 col-md-9 p-0">
                    <div className="m-0 p-0" style={{ minHeight: '100vh' }}>
                        {selectedComponent === 'dashboard' && <DashboardHome onItemClick={handleMenuItemClick} />}
                        {selectedComponent === 'addproducts' && <AddProducts />}
                        {selectedComponent === 'orders' && <Orders />}
                        {selectedComponent === 'products' && <Products />}
                        {selectedComponent === 'customers' && <Customers />}
                        {selectedComponent === 'categories' && <Categories />}
                        {selectedComponent === 'coupons' && <Coupons onItemClick={handleMenuItemClick} />}
                        {selectedComponent === 'loyalty-points' && <LoyaltyPoints />}
                        {selectedComponent === 'table-reservations' && <TableReservations />}
                        {selectedComponent === 'reviews' && <Reviews />}
                        {selectedComponent === 'food-delivery-addresses' && <FoodDeliveryAddress />}
                        {selectedComponent === 'extra-items' && <ExtraItems />}
                        {selectedComponent === 'live-chat' && <LiveChat />}
                        {selectedComponent === 'reports' && <Revenue />}
                    </div>
                </div>
            </div>
        </div>
    );
}