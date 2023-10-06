const express = require("express");

const forgotpasswordController = require("../controllers/password");

const router = express.Router();

router.get(
  "/resetpassword/:uuidd",
  forgotpasswordController.renderResetPasswordForm
);

router.post(
  "/updatepassword/:resetpasswordid",
  forgotpasswordController.updatepassword
);

router.post("/forgotpassword", forgotpasswordController.forgotpassword);

module.exports = router;
