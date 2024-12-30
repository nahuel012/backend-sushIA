const router = require("express").Router();
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    message: "API funcionando correctamente",
  });
});

module.exports = router;
