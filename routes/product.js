const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductDetails,
} = require("../controllers/productController");

router.route("/product").get(getProducts);
router.route("/product/:id").get(getProductDetails);

module.exports = router;
