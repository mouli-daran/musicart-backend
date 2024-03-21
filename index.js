const express = require("express");
require("dotenv").config();

const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
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

//regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

//routes import
const user = require("./routes/user");

//routes middleware
app.use("/api/v1/", user);

module.exports = app;
