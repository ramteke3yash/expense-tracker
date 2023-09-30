const Sib = require("sib-api-v3-sdk");
const User = require("../models/user");
const ForgotPasswordRequests = require("../models/forgotPassword");
const uuid = require("uuid");
require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");

const PASSWORD_API_KEY = process.env.PASSWORD_API_KEY;

exports.forgotpassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestId = uuid.v4();

    await ForgotPasswordRequests.create({
      id: requestId,
      userId: user.id,
      isActive: true,
    });

    const resetPasswordUrl = `http://localhost:3000/password/resetpassword/${requestId}`;

    // Create a transporter for sending email
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.brevo_email,
        pass: process.env.brevo_password,
      },
    });

    // Define email content
    const mailOptions = {
      from: process.env.brevo_email,
      to: email,
      subject: "Expense Tracker reset password link",
      text: `Greetings dear user here's, your reset link - ${resetPasswordUrl}\nThis is valid for 10 time only.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
      } else {
        console.log("Email sent: " + info.response);
        return res.json({
          message: "A reset link has been sent to your email",
          success: true,
          msg: "ok",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.renderResetPasswordForm = async (req, res) => {
  const uuidd = req.params.uuidd;
  try {
    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: { id: uuidd, isActive: true },
    });

    if (!forgotPasswordRequest) {
      return res
        .status(404)
        .json({ message: "Link is not valid", success: false });
    }

    const absolutePath = path.join(__dirname, "../reset_password.html");
    res.sendFile(absolutePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

exports.resetPassword = async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  console.log("this is myy uid->>", id);
  try {
    // Find the record with the given uuid
    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: { id, isActive: true },
    });

    if (!forgotPasswordRequest) {
      return res
        .status(404)
        .json({ message: "Link is not valid", success: false });
    }

    // Extract the user ID from the forgotPasswordRequest
    const userId = forgotPasswordRequest.userId;

    // Check if the password is provided and not empty
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required", success: false });
    }

    // Hash the new password
    const hash = await bcrypt.hash(password, 10);

    // Update the user's password
    await User.update(
      { password: hash },
      {
        where: { id: userId },
      }
    );

    // Deactivate the forgot password request
    await forgotPasswordRequest.update({ isActive: false });

    res.redirect("../login.html");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
