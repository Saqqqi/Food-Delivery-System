import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import axios from "axios";
import { useToast } from "../../ToastManager";
import { FaBox, FaDollarSign, FaTags, FaUtensils, FaImage, FaInfoCircle, FaPlusCircle, FaCube } from "react-icons/fa";

// Add custom CSS for styling
const styles = `
  /* Modern Dark Theme for Add Products */
  .add-products-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    margin: 20px;
    padding: 25px;
    border: 1px solid rgba(255, 193, 7, 0.2);
  }
  
  .add-products-header {
    color: #ffc107;
    font-weight: 700;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid rgba(255, 193, 7, 0.3);
    text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  }
  
  .custom-form-label {
    color: #ffc107;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .custom-form-control, .custom-form-select {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 12px 15px;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }
  
  .custom-form-control:focus, .custom-form-select:focus {
    border-color: #ffc107;
    box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.25);
    background: rgba(255, 255, 255, 0.12);
    outline: none;
  }
  
  .custom-form-control::placeholder {
    color: #718096;
  }
  
  .input-group-text {
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px 0 0 8px;
    border-right: none;
  }
  
  .custom-button {
    background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
    color: #1a1a2e;
    border: none;
    border-radius: 8px;
    padding: 12px 25px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
    display: flex;
    align-items: center;
    margin-top: 20px;
  }
  
  .custom-button:hover {
    background: linear-gradient(135deg, #e0a800 0%, #e68a00 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  }
  
  .custom-button:active {
    transform: translateY(0);
  }
  
  .custom-checkbox-label {
    color: #ffffff;
    font-weight: 500;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .custom-checkbox-input {
    margin-right: 10px;
    accent-color: #ffc107;
  }
  
  .form-section {
    background: rgba(26, 26, 46, 0.5);
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 193, 7, 0.1);
  }
  
  .section-title {
    color: #ffc107;
    font-weight: 600;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .add-products-container {
      margin: 10px;
      padding: 15px;
    }
    
    .custom-button {
      width: 100%;
      justify-content: center;
    }
  }
`;

export default function AddProducts() {
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    model3d: "",
    inStock: true,
    restaurant: "our", // 'our' or the name of other restaurant
    restaurantName: "Our Restaurant" // Display name of the restaurant
  });

  const [restaurants, setRestaurants] = useState([
    { id: 'our', name: 'Our Restaurant' } // Default restaurant as fallback
  ]);

  // Fetch restaurants from API
  useEffect(() => {
    axios.get('http://localhost:3005/api/restaurant-delivery-addresses')
      .then((res) => {
        // Map the restaurant delivery addresses to the format needed for the dropdown
        const fetchedRestaurants = res.data.map(restaurant => ({
          id: restaurant._id,
          name: restaurant.restaurantName
        }));

        // Add the default restaurant if it's not already in the list
        const hasDefaultRestaurant = fetchedRestaurants.some(r => r.id === 'our' || r.name === 'Our Restaurant');

        if (!hasDefaultRestaurant) {
          fetchedRestaurants.unshift({ id: 'our', name: 'Our Restaurant' });
        }

        setRestaurants(fetchedRestaurants);
      })
      .catch((err) => {
        console.error("Error fetching restaurants:", err);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, type, checked, files, value } = e.target;
    let finalValue;

    if (type === "checkbox") {
      finalValue = checked;
    } else if (type === "file") {
      finalValue = files[0]; // actual file
      if (name === "model3d") {
        console.log("3D Model Selected:", files[0]);
      }
    } else if (name === "restaurant") {
      // Find the selected restaurant from the dynamically loaded restaurants array
      const selectedRestaurant = restaurants.find(r => r.id === value) || { id: 'our', name: 'Our Restaurant' };
      return setProductData({
        ...productData,
        restaurant: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name
      });
    } else {
      finalValue = value;
    }

    setProductData({ ...productData, [name]: finalValue });
  };

  const showToast = useToast();

  const handleSuccess = () => {
    showToast("Success", "Product added successfully!", "success");
  };

  const handleError = () => {
    showToast("Error", "Something went wrong!", "danger");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("price", productData.price);
    formData.append("category", productData.category);
    formData.append("description", productData.description);
    formData.append("inStock", productData.inStock);
    formData.append("restaurant", productData.restaurant);
    formData.append("restaurantName", productData.restaurantName);
    formData.append("image", productData.image); // important: actual file
    if (productData.model3d) {
      formData.append("model3d", productData.model3d);
    }

    try {
      const response = await axios.post("http://localhost:3005/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleSuccess();
      // Reset form with default values
      setProductData({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
        model3d: "",
        inStock: true,
        restaurant: restaurants[0]?.id || "our",
        restaurantName: restaurants[0]?.name || "Our Restaurant"
      });
    } catch (error) {
      console.error("Error adding product:", error);
      handleError();
    }
  };

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3005/category')
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  return (
    <div className="container py-5 px-0">
      {/* Inject custom CSS */}
      <style>{styles}</style>

      <div className="add-products-container">
        <h4 className="add-products-header">
          <FaBox className="me-2" />
          Add New Product
        </h4>
        <Form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h5 className="section-title">
              <FaInfoCircle />
              Basic Information
            </h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label className="custom-form-label">Product Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaBox />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter product name"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="price">
                  <Form.Label className="custom-form-label">Price</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaDollarSign />
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Enter price"
                      name="price"
                      value={productData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="category">
                  <Form.Label className="custom-form-label">Category</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaTags />
                    </InputGroup.Text>
                    <Form.Select
                      name="category"
                      value={productData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat.name}>{cat.name}</option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="restaurant">
                  <Form.Label className="custom-form-label">Restaurant</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUtensils />
                    </InputGroup.Text>
                    <Form.Select
                      name="restaurant"
                      value={productData.restaurant}
                      onChange={handleInputChange}
                      required
                    >
                      {restaurants.map((restaurant) => (
                        <option key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Media Section */}
          <div className="form-section">
            <h5 className="section-title">
              <FaImage />
              Media
            </h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="image">
                  <Form.Label className="custom-form-label">Product Image</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaImage />
                    </InputGroup.Text>
                    <Form.Control
                      type="file"
                      name="image"
                      onChange={handleInputChange}
                      accept="image/*"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="model3d">
                  <Form.Label className="custom-form-label">3D Model (.glb, .obj)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaCube />
                    </InputGroup.Text>
                    <Form.Control
                      type="file"
                      name="model3d"
                      onChange={handleInputChange}
                      accept=".glb,.obj,.gltf"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Description Section */}
          <div className="form-section">
            <h5 className="section-title">
              <FaInfoCircle />
              Description
            </h5>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group controlId="description">
                  <Form.Label className="custom-form-label">Product Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter detailed product description"
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Availability Section */}
          <div className="form-section">
            <h5 className="section-title">
              <FaInfoCircle />
              Availability
            </h5>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group controlId="inStock">
                  <Form.Check
                    type="checkbox"
                    label="Product is currently in stock"
                    name="inStock"
                    checked={productData.inStock}
                    onChange={handleInputChange}
                    className="custom-checkbox-label"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <Button
            type="submit"
            className="custom-button"
          >
            <FaPlusCircle className="me-2" />
            Add Product
          </Button>
        </Form>
      </div>
    </div>
  );
}