const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  addFeedback,
} = require("../controllers/userController");

const { isLoggedIn } = require("../middlewares/user");

//middleware import

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/feedback").put(isLoggedIn, addFeedback);

module.exports = router;
