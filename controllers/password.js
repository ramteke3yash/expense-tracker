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
    res.setHeader(
      "Content-Security-Policy",
      `script-src 'self' cdnjs.cloudflare.com 'unsafe-inline'`
    );

    res.sendFile(absolutePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

exports.updatepassword = async (req, res) => {
  try {
    const newpassword = req.body.password;
    const { resetpasswordid } = req.params;
    console.log("my new password is here;", newpassword);
    console.log("my new reset id is here;", resetpasswordid);

    const resetpasswordrequest = await ForgotPasswordRequests.findOne({
      where: { id: resetpasswordid },
    });

    if (!resetpasswordrequest) {
      return res
        .status(404)
        .json({ error: "Forgot password request not found", success: false });
    }

    // Checking if the request is still active
    if (!resetpasswordrequest.isActive) {
      return res.status(403).json({
        error: "Forgot password request is no longer active",
        success: false,
      });
    }

    const user = await User.findOne({
      where: { id: resetpasswordrequest.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "No user exists", success: false });
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(newpassword, saltRounds);

    // Update the user's password and deactivate the forgot password request
    await user.update({ password: hash });
    await resetpasswordrequest.update({ isActive: false });

    res.status(201).json({ message: "Successfully updated the new password" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", success: false });
  }
};
