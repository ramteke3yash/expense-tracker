const express = require("express");

const User = require("../models/user");
const userController = require("../controllers/user");

const router = express.Router();

router.post("/add-user", userController.signinUser);
router.post("/login", userController.loginUser);

router.post("/add-user", () => {
  console.log("i am not an error");
});
router.post("/login", () => {
  console.log("i am login ");
});

module.exports = router;
