const express = require("express");

const router = express.Router();
const User = require("../models/user");

const userController = require("../controllers/user");

router.post("/user/add-user", userController.postUser);

module.exports = router;
