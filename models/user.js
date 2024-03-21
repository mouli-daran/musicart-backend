const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const Product = require("../models/product");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
    maxLength: [40, "Name should be minimum of 10 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "Email is not in correct form"],
    unique: true,
  },
  mobile: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password must be minimum 6 characters"],
    select: false,
  },
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  feedback: [
    {
      typeOfFeedback: {
        type: String,
        enum: ["bugs", "feedback", "query"],
        required: true,
      },
      feedbackText: {
        type: String,
        required: true,
      },
    },
  ],
  orders: {
    type: Array,
    required: false,
    unique: false,
  },
});

//encrypt password before save -hooks
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

//create and return jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//compare and validate passed on user password
userSchema.methods.isValidatePassword = async function (password) {
  console.log(password);
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
