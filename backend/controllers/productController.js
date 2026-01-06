const Product = require('../models/products');

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, description, inStock, restaurant, restaurantName } = req.body;

    const productData = {
      name,
      price: Number(price),
      category,
      description,
      inStock: inStock === 'false' ? false : true, // convert to boolean
      restaurant: {
        id: restaurant || 'our',
        name: restaurantName || 'Our Restaurant'
      }
    };


    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        productData.image = req.files.image[0].path;
      }
      if (req.files.model3d && req.files.model3d[0]) {
        productData.model3d = req.files.model3d[0].path;
      }
    } else if (req.file) {
      productData.image = req.file.path;
    }

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, description, inStock, restaurant, restaurantName } = req.body;

    const updateData = {
      name,
      price: Number(price),
      category,
      description,
      inStock: inStock === 'false' ? false : true,
      'restaurant.id': restaurant || 'our',
      'restaurant.name': restaurantName || 'Our Restaurant'
    };


    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updateData.image = req.files.image[0].path;
      }
      if (req.files.model3d && req.files.model3d[0]) {
        updateData.model3d = req.files.model3d[0].path;
      }
    } else if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};