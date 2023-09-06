const express = require("express");

const User = require("../models/user");
const userController = require("../controllers/user");

const router = express.Router();

router.post("/add-user", userController.signinUser);
router.post("/login", userController.loginUser);

module.exports = router;
