const Sib = require("sib-api-v3-sdk");
const User = require("../models/user");
const ForgotPasswordRequests = require("../models/forgotPassword");
const uuid = require("uuid");
require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const path = require("path");

const PASSWORD_API_KEY = process.env.PASSWORD_API_KEY;

/**
 * Forgot Password Request
 *
 * This function is responsible for handling a request to reset a user's password. It expects a POST request with the user's 'email' in the request body. It checks if the user with the provided email exists, creates a unique request identifier, stores it in the database, and sends a reset password link to the user's email address.
 *
 * @param {Object} req - The HTTP request object, which should contain 'email' in the request body.
 * @param {Object} res - The HTTP response object used to send a success message or an error message.
 * @param {function} next - The next function for passing control to the next middleware (if applicable).
 *
 * @throws {Error} If there is an internal server error during the password reset request process.
 *
 * @returns {Object} The function sends an HTTP response indicating the result of the password reset request, including success or error messages.
 */
exports.forgotpassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique request identifier
    const requestId = uuid.v4();

    // Create a record of the password reset request in the database
    await ForgotPasswordRequests.create({
      id: requestId,
      userId: user.id,
      isActive: true,
    });

    // Construct the reset password link
    const resetPasswordUrl = `http://localhost:3000/password/resetpassword/${requestId}`;

    // Create a transporter for sending email using nodemailer
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
    // Handle internal server errors and send an error response
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Render Reset Password Form
 *
 * This function renders a web page for resetting the user's password. It expects a GET request with a unique 'uuidd' parameter in the URL. The function checks if the provided 'uuidd' exists in the database and is active. If it's valid, it renders an HTML form for resetting the password.
 *
 * @param {Object} req - The HTTP request object, which should contain a 'uuidd' parameter in the URL.
 * @param {Object} res - The HTTP response object used to render the HTML form or send an error message.
 *
 * @throws {Error} If there is an internal server error during the rendering process.
 *
 * @returns {HTML} The function renders an HTML form for resetting the password if the 'uuidd' is valid and active. Otherwise, it sends an error message.
 */
exports.renderResetPasswordForm = async (req, res) => {
  const uuidd = req.params.uuidd;
  try {
    // Check if the provided 'uuidd' exists and is active in the database
    const forgotPasswordRequest = await ForgotPasswordRequests.findOne({
      where: { id: uuidd, isActive: true },
    });

    if (!forgotPasswordRequest) {
      return res
        .status(404)
        .json({ message: "Link is not valid", success: false });
    }

    if (forgotPasswordRequest.isActive) {
      // Render the HTML form for resetting the password
      res.send(`<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset</title>
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.0/axios.min.js"
          ></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #007bff, #8a2be2);
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-attachment: fixed;
              background-size: cover;
            }
      
            .container {
              max-width: 400px;
              margin: 0 auto;
              padding: 35px 45px;
              background-color: #fff;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              border-radius: 10px;
              text-align: center;
            }
      
            .container h2 {
              margin-top: 1px;
              margin-bottom: 20px;
              color: #333;
              font-size: 30px;
            }
      
            .input-group {
              margin-bottom: 15px;
            }
      
            .input-group label {
              display: block;
              text-align: left;
              margin-bottom: 10px;
              font-weight: bold;
              color: #555;
            }
      
            .input-group input {
              width: 93%;
              padding: 10px;
              margin-bottom: 15px;
              border: 1px solid #ccc;
              border-radius: 50px;
              font-size: 16px;
            }
            .btn {
              background-color: #007bff;
              color: #fff;
              padding: 13px 100px;
              border: none;
              border-radius: 50px;
              cursor: pointer;
              font-size: 17px;
              transition: background-color 0.3s;
            }
      
            .btn:hover {
              background-color: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <form action="#" method="POST" id="reset-password-form">
              <div class="input-group">
                <input
                  type="hidden"
                  name="resetpasswordid"
                  id="resetpasswordid"
                  value=""
                />
                <label for="password">New Password:</label>
                <input type="password" id="password" name="password" required />
              </div>
              <button type="submit" class="btn">Reset Password</button>
            </form>
          </div>
      
          <!-- 
          <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script> -->
          <script>
      
            const form = document.getElementById("reset-password-form");
            const passwordInput = document.getElementById("password");
            const resetpasswordidInput = document.getElementById("resetpasswordid");
      
            //getting uuid from url
            function getResetPasswordIdFromURL() {
              const urlSegments = window.location.href.split("/");
              const resetpasswordid = urlSegments[urlSegments.length - 1];
      
              return resetpasswordid;
            }
      
            async function resetPassword() {
              const password = passwordInput.value;
              const resetpasswordid = resetpasswordidInput.value;
      
              if (!password || !resetpasswordid) {
                alert("Please enter both password and resetpasswordid.");
                return;
              }
      
              const resetData = { password, resetpasswordid };
              //"http://localhost:3000" http://localhost:3000
      
              try {
                const response = await axios.post(
                  "http://localhost:3000/password/updatepassword/" + resetpasswordid,
                  resetData
                );
      
                console.log("Password reset successful:", response.data);
                alert("Password has been reset successfully! Please log in.");
              } catch (error) {
                console.error("Password reset failed:", error);
                alert("Password reset failed. Please try again.");
              }
            }
      
            window.addEventListener("load", function () {
              const resetpasswordid = getResetPasswordIdFromURL();
              resetpasswordidInput.value = resetpasswordid;
            });
      
            form.addEventListener("submit", function (e) {
              e.preventDefault();
              resetPassword();
            });
          </script>
        </body>
      </html>`);
    }
  } catch (error) {
    // Handle internal server errors and send an error response
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * Update Password
 *
 * This function is responsible for updating a user's password based on a password reset request. It expects a POST request with the new 'password' in the request body and the 'resetpasswordid' as a parameter in the URL. The function checks if the provided 'resetpasswordid' is valid and still active, retrieves the corresponding user, hashes the new password, updates the user's password, and deactivates the password reset request.
 *
 * @param {Object} req - The HTTP request object, which should contain 'password' in the request body and 'resetpasswordid' as a URL parameter.
 * @param {Object} res - The HTTP response object used to send a success message or an error message.
 *
 * @throws {Error} If there is an internal server error during the password update process.
 *
 * @returns {Object} The function sends an HTTP response indicating the result of the password update, including a success message or an error message.
 */
exports.updatepassword = async (req, res) => {
  try {
    const newpassword = req.body.password;
    const { resetpasswordid } = req.params;

    // Check if the provided 'resetpasswordid' exists in the password reset requests
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

    // Retrieve the corresponding user for the password reset
    const user = await User.findOne({
      where: { id: resetpasswordrequest.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "No user exists", success: false });
    }

    // Hash the new password
    const saltRounds = 10;
    const hash = await bcrypt.hash(newpassword, saltRounds);

    // Update the user's password and deactivate the forgot password request
    await user.update({ password: hash });
    await resetpasswordrequest.update({ isActive: false });

    res.status(201).json({ message: "Successfully updated the new password" });
  } catch (error) {
    // Handle internal server error and send an error response
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", success: false });
  }
};
