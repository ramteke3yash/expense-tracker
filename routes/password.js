const express = require("express");

const forgotpasswordController = require("../controllers/password");

const router = express.Router();

// Handle password reset form rendering
router.get(
  "/resetpassword/:uuidd",
  forgotpasswordController.renderResetPasswordForm
);

// Handle password reset form submission
router.post("/resetpassword/:id", forgotpasswordController.resetPassword);

router.post("/forgotpassword", forgotpasswordController.forgotpassword);

module.exports = router;
