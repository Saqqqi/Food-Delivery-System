import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import './DineInMenu.css';

const DineInMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDineInMenuItems = async () => {
      try {
        const response = await axios.get('http://localhost:3005/api/dine-in-menu');
        setMenuItems(response.data.data.menuItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching dine-in menu items:', err);
        setError('Failed to load dine-in menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDineInMenuItems();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="warning" />
        <p>Loading Dine-In Menu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="dine-in-menu-page">
      <Container className="py-5">
        <h2 className="text-center mb-5 text-white">Our Dine-In Menu</h2>
        <Row xs={1} md={2} lg={3} className="g-4">
          {menuItems.map((item) => (
            <Col key={item.id}>
              <Card className="menu-item-card">
                <Card.Body>
                  <Card.Title className="menu-item-title">{item.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted menu-item-subtitle">{item.category}</Card.Subtitle>
                  <Card.Text className="menu-item-description">{item.description}</Card.Text>
                  <Card.Text className="menu-item-price">${item.price.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default DineInMenu;