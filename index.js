const express = require("express");
require("dotenv").config();

const app = express();
const morgan = require("morgan");

const cors = require("cors");

// morgan import
app.use(morgan("tiny"));

//cors import
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//regular import
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//routes import

//routes middleware

module.exports = app;
