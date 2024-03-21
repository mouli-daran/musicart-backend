const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductDetails,
  addToCart,
  getCartProduct,
  placeOrder,
} = require("../controllers/productController");

const { isLoggedIn } = require("../middlewares/user");

router.route("/product").get(getProducts);
router.route("/product/:id").get(getProductDetails);
router.route("/cart").put(isLoggedIn, addToCart);
router.route("/cartproducts").get(isLoggedIn, getCartProduct);
router.route("/placeorder").put(isLoggedIn, placeOrder);

module.exports = router;
