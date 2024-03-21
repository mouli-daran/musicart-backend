const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/CustomError");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieToken = require("../utils/cookieToken");
const validator = require("validator");

exports.register = BigPromise(async (req, res, next) => {
  try {
    const { name, mobile, email, password } = req.body;

    if (!name || !mobile || !email || !password) {
      return next(
        new CustomError("A field is missing, please check all inputs", 400)
      );
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(new CustomError("Email is not in correct format", 400));
    }

    // Validate password complexity
    if (
      !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])[a-zA-Z0-9\W_]{6,}/.test(
        password
      )
    ) {
      return next(
        new CustomError(
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
          400
        )
      );
    }

    const existingEmail = await User.findOne({ email });
    const existingMobile = await User.findOne({ mobile });

    if (existingEmail || existingMobile) {
      return next(
        new CustomError("Email or mobile number already exists", 400)
      );
    }

    const user = await User.create({
      name,
      mobile,
      email,
      password,
    });

    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    return next(new CustomError("Internal server error", 500));
  }
});

exports.login = BigPromise(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new CustomError("Please provide email or password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(
        new CustomError(
          "User not found in our database, Please check your details.",
          401
        )
      );
    }
    const isCorrectPassword = await user.isValidatePassword(password);

    if (!isCorrectPassword) {
      return next(new CustomError("Password is incorrect..try again", 401));
    }

    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    return next(new CustomError("Internal server error", 500));
  }
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout Success. Please Login to access content",
  });
});

exports.addFeedback = BigPromise(async (req, res, next) => {
  const { typeOfFeedback, feedbackText } = req.body;

  if (!typeOfFeedback || !feedbackText) {
    return next(
      new CustomError("A field is missing, please check all inputs", 400)
    );
  }

  try {
    // Create a new feedback object
    const newFeedback = {
      typeOfFeedback,
      feedbackText,
    };

    if (!req.user.feedback) {
      await req.user.populate("feedback").execPopulate();
    }
    // Push the new feedback object into the feedback array of the user document
    req.user.feedback.push(newFeedback);

    // Save the updated user document
    await req.user.save();

    res.status(201).json({
      success: true,
      feedback: newFeedback,
    });
  } catch (error) {
    console.log(error);
    return next(new CustomError("Internal server error", 500));
  }
});
