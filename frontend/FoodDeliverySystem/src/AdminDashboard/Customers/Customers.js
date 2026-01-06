import React, { useState } from 'react';
import { Modal, Button, InputGroup, FormControl } from 'react-bootstrap';

export function PromotionLink() {
    const [link, setLink] = useState('');

    const handleInputChange = (e) => {
        setLink(e.target.value);
    };

    const handleSendPromotionLink = () => {
        // Implement logic to send promotional link
        console.log("Sending promotional link:", link);
    };

    return (
        <div style={{ display: 'grid', gap: '10px', placeItems: 'center' }}>
            <input
                type="text"
                placeholder="Enter promotional link"
                value={link}
                onChange={handleInputChange}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '300px' }}
            />
            <button
                onClick={handleSendPromotionLink}
                style={{ backgroundColor: '#123A5D', color: '#fff', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
            >
                Send Promotion to Customers
            </button>
        </div>
    );
}

export default function Customers() {
    const [show, setShow] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCustomerData, setSelectedCustomerData] = useState({}); // Define the state here
    const customersPerPage = 15;

    const allCustomers = [
        { id: 1, name: 'Customer 1', email: 'customer1@example.com', city: 'City A', address: '123 Street', state: 'State A', registrationDate: '2023-01-01' },
        { id: 2, name: 'Customer 1', email: 'customer1@example.com', city: 'City A', address: '123 Street', state: 'State A', registrationDate: '2023-01-01' },
        { id: 3, name: 'Customer 1', email: 'customer1@example.com', city: 'City A', address: '123 Street', state: 'State A', registrationDate: '2023-01-01' },
        { id: 4, name: 'Customer 2', email: 'customer2@example.com', city: 'City B', address: '456 Avenue', state: 'State B', registrationDate: '2023-02-01' },
        { id: 5, name: 'Customer 2', email: 'customer2@example.com', city: 'City B', address: '456 Avenue', state: 'State B', registrationDate: '2023-02-01' },
        { id: 6, name: 'Customer 3', email: 'customer3@example.com', city: 'City C', address: '789 Boulevard', state: 'State C', registrationDate: '2023-03-01' },
        { id: 7, name: 'Customer 3', email: 'customer3@example.com', city: 'City C', address: '789 Boulevard', state: 'State C', registrationDate: '2023-03-01' },
        { id: 8, name: 'Customer 4', email: 'customer4@example.com', city: 'City D', address: '101 Road', state: 'State D', registrationDate: '2023-04-01' },
        { id: 9, name: 'Customer 5', email: 'customer5@example.com', city: 'City E', address: '202 Lane', state: 'State E', registrationDate: '2023-05-01' },
        { id: 11, name: 'Customer 5', email: 'customer5@example.com', city: 'City E', address: '202 Lane', state: 'State E', registrationDate: '2023-05-01' },
        { id: 12, name: 'Customer 5', email: 'customer5@example.com', city: 'City E', address: '202 Lane', state: 'State E', registrationDate: '2023-05-01' },
        { id: 13, name: 'Customer 6', email: 'customer6@example.com', city: 'City F', address: '303 Drive', state: 'State F', registrationDate: '2023-06-01' },
        { id: 14, name: 'Customer 6', email: 'customer6@example.com', city: 'City F', address: '303 Drive', state: 'State F', registrationDate: '2023-06-01' },
        { id: 16, name: 'Customer 6', email: 'customer6@example.com', city: 'City F', address: '303 Drive', state: 'State F', registrationDate: '2023-06-01' },
        // Add more customers as needed
    ];

    const filteredCustomers = allCustomers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const handleClose = () => setShow(false);
    const handleShow = (customer) => {
        setSelectedCustomerData(customer); // Update selected customer data
        setShow(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedCustomerData({ ...selectedCustomerData, [name]: value });
    };

    const handleUpdate = () => {
        console.log("Updated customer data:", selectedCustomerData);
        handleClose();
    };

    const handleDelete = (id) => {
        alert("Customer data deleted");
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredCustomers.length / customersPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className='container py-3'>
            <div className='bg-white shadow-lg p-3 rounded'>
                <div className='row px-2'>
                    <div className='col-md-8'><h4>Customers List</h4></div>
                    <div className='col-md-4'>
                        <InputGroup className="mb-3">
                            <FormControl
                                placeholder="Search by customer name"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                    </div>
                </div>
                <div>
                    <table className="table table-hover spaced-table" style={{
                        borderSpacing: "0 10px",
                        borderCollapse: "separate",
                        width: "100%"
                    }}>
                        <thead>
                            <tr>
                                <th>All</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>City</th>
                                <th>Address</th>
                                <th>State</th>
                                <th>Registration Date</th>
                                <th className='text-end'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <input type="checkbox" />
                                    </td>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.city}</td>
                                    <td>{customer.address}</td>
                                    <td>{customer.state}</td>
                                    <td>{customer.registrationDate}</td>
                                    <td className='text-end'>

                                        <i
                                            className="fas fa-trash"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleDelete(customer.id)}
                                        ></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination d-flex justify-content-between flex-wrap">
                    <Button variant="primary" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
                    <Button variant="primary" onClick={handleNextPage} disabled={currentPage * customersPerPage >= filteredCustomers.length}>Next</Button>
                </div>

            </div>
        </div>
    );
}
