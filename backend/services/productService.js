const productRepository = require('../repositories/productRepository');

exports.createProduct = async (productData) => {
  return await productRepository.createProduct(productData);
};

exports.getProducts = async () => {
  return await productRepository.getProducts();
};

exports.getProductById = async (id) => {
  return await productRepository.getProductById(id);
};

exports.updateProduct = async (id, updateData) => {
  return await productRepository.updateProduct(id, updateData);
};

exports.deleteProduct = async (id) => {
  return await productRepository.deleteProduct(id);
};
