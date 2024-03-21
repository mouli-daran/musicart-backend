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
