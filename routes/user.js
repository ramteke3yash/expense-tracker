const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userController = require("../controllers/user");

router.post("/add-user", userController.signinUser);
router.post("/login", userController.loginUser);

module.exports = router;
