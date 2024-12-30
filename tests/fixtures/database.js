const { Category, Product, Order } = require("../../src/models");

const setupTestCategory = async () => {
  const category = new Category({
    name: "Rolls",
    description: "Rolls tradicionales",
    order: 1,
  });
  await category.save();
  return category;
};

const setupTestProduct = async (categoryId) => {
  const product = new Product({
    name: "Roll de prueba",
    description: "Roll de prueba",
    price: 10,
    category: categoryId,
  });
  await product.save();
  return product;
};

module.exports = {
  setupTestCategory,
  setupTestProduct,
};
