const express = require("express");

const User = require("../models/user");
const userController = require("../controllers/user");

const expenseController = require("../controllers/expense");
const { route } = require("./expense");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.post("/add-user", userController.signinUser);
router.post("/login", userController.loginUser);

router.get("/download", authenticate, expenseController.downloadexpense);

module.exports = router;
