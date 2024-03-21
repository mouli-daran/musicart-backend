const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/user");
const Product = require("../models/product");
const isLoggedIn = require("../middlewares/user");
const product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");

exports.getProducts = BigPromise(async (req, res, next) => {
  try {
    let products = await Product.find();

    // Getting all filter and sort values from the request query
    const {
      search,
      brand,
      headphoneType,
      featured,
      colour,
      sortPrice,
      sortName,
      minPrice,
      maxPrice,
    } = req.query;

    // Setting product query
    const productQuery = {
      brand: { $regex: new RegExp(brand, "i") },
      headphoneType: { $regex: new RegExp(headphoneType, "i") },
      colour: { $regex: new RegExp(colour, "i") },
      $or: [
        { detailHeading: { $regex: new RegExp(search, "i") } },
        { aboutThisItem: { $regex: new RegExp(search, "i") } },
      ],
    };

    // Inserting featured value in query
    if (featured !== undefined) {
      productQuery.featured = featured;
    }

    // Setting price filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      productQuery.price = {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice),
      };
    }

    // Setting sorting value
    let productSort = {};
    if (sortPrice) {
      productSort.price = sortPrice;
    } else if (sortName) {
      productSort.brand = sortName;
    }

    // Fetching products based on the query and sorting
    products = await Product.find(productQuery)
      .sort(productSort)
      .collation({ locale: "en", strength: 2 });

    res.status(200).json({ status: "SUCCESS", data: products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.getProductDetails = BigPromise(async (req, res, next) => {
  try {
    const productDetails = await product.findById(req.params.id);
    if (!productDetails) {
      return next(new CustomError("Product details not found", 400));
    }

    res.status(200).json({ status: "SUCCESS", data: productDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.addToCart = BigPromise(async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid products array" });
    }

    // Fetch user
    const user = await User.findById(req.user._id);

    // Iterate over each product in the request
    for (const cartItem of products) {
      const { id, quantity, replaceQuantity } = cartItem;
      let newItem = true;

      // Check if the product already exists in the user's cart
      for (let i = 0; i < user.cart.length; i++) {
        const productId = user.cart[i].productId.toString();
        if (productId === id) {
          // Update quantity if the product exists
          if (replaceQuantity) {
            user.cart[i].quantity = quantity;
          } else {
            user.cart[i].quantity += quantity;
          }
          newItem = false;
          break;
        }
      }

      // If the product is not already in the cart, add it
      if (newItem) {
        const productToAdd = await Product.findById(id);
        user.cart.push({
          productId: productToAdd._id,
          quantity: parseInt(quantity),
        });
      }
    }

    // Update user's cart
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      cart: user.cart,
    });

    res.status(200).json({
      status: "SUCCESS",
      message: "Added to Cart",
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.getCartProduct = BigPromise(async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Retrieve user's cart products
    const user = await User.findById(req.user._id).populate("cart.productId");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract cart products from the user object
    const cartProducts = user.cart.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      quantity: item.quantity,
      price: item.productId.price,
      // Add other product details as needed
    }));

    res.status(200).json({
      status: "SUCCESS",
      data: cartProducts,
    });
  } catch (error) {
    console.error("Error fetching cart products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

exports.placeOrder = BigPromise(async (req, res, next) => {
  try {
    const { name, address, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!name || !address || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Name, address, and payment method are required" });
    }

    // Fetch user's cart
    const user = await User.findById(userId).populate("cart.productId");
    const cartItems = user.cart;

    // Create order object
    const order = {
      name: name,
      address: address,
      paymentMethod: paymentMethod,
      products: cartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      orderTime: new Date(),
    };

    // Push order to user's orders array
    user.orders.push(order);

    // Clear user's cart
    user.cart = [];

    // Save updated user
    await user.save();

    res.status(200).json({
      status: "SUCCESS",
      message: "Order placed successfully",
      order: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
