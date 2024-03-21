const user = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/CustomError");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.isLoggedIn = BigPromise(async (req, res, next) => {
  let token;

  // Check if token is present in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Check if token is present in the Authorization header
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new CustomError("Token is not present", 400));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use asynchronous findById method of User model
    req.user = await User.findById(decoded.id);

    // If user not found, return an error
    if (!req.user) {
      return next(new CustomError("User not found", 404));
    }

    next();
  } catch (error) {
    // If token verification fails, return an error
    return next(new CustomError("Invalid token", 401));
  }
});
