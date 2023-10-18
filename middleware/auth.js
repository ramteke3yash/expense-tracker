const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

/**
 * Authentication Middleware
 *
 * This middleware function is responsible for authenticating and verifying a user's access using a JSON Web Token (JWT). It expects the JWT token to be included in the 'Authorization' header of the HTTP request. The function verifies the token's authenticity, checks if the associated user exists, and attaches the user information to the request object.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next function for passing control to the next middleware.
 *
 * @throws {Error} If there is an issue with token verification or if the user is not found.
 *
 * @returns {void} If the token is valid and the associated user is found, it attaches the user information to the request object and passes control to the next middleware. Otherwise, it sends an error response.
 */
const authenticate = (req, res, next) => {
  try {
    // Get the JWT token from the 'Authorization' header
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Verify the authenticity of the token using the secret key
    const user = jwt.verify(token, process.env.secretkey);

    // Find the user by their user ID
    User.findByPk(user.userId).then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
      // Attach the user information to the request object
      req.user = user;
      next();
    });
  } catch (err) {
    // Send an error response
    return res
      .status(401)
      .json({ success: false, message: "Token is invalid" });
  }
};

module.exports = authenticate;
