const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/auth");
require("dotenv").config();

const secretkey = process.env.secretkey;

/**
 * Sign Up a New User
 *
 * This function is responsible for creating a new user account when a user signs up. It expects a POST request with a JSON body containing 'name', 'email', and 'password'. It validates the input parameters and checks if a user with the same email already exists. If not, it securely hashes the password and creates a new user account in the database.
 *
 * @param {Object} req - The HTTP request object, which should contain 'name', 'email', and 'password' in the request body.
 * @param {Object} res - The HTTP response object used to send a success message or an error message.
 * @param {function} next - The next function for passing control to the next middleware (if applicable).
 *
 * @throws {Error} If there is an internal server error during the user creation process.
 *
 * @returns {Object} The function sends an HTTP response with a success message upon successful user creation, or an error message with the appropriate status code.
 */
exports.signinUser = async (req, res, next) => {
  try {
    // Extract 'name', 'email', and 'password' from the request body
    const { name, email, password } = req.body;

    // Check if any of the required parameters are missing or empty
    if (
      !name ||
      name.trim() === "" ||
      !password ||
      password.trim() === "" ||
      !email ||
      email.trim() === ""
    ) {
      return res
        .status(400)
        .json({ error: "Bad parameters. Something is missing" });
    }

    // Check if a user with the same email already exists in the database
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash the password securely with bcrypt
    bcrypt.hash(password, 10, async (err, hash) => {
      // Create a new user in the database with the provided details
      const data = await User.create({
        name: name,
        email: email,
        password: hash,
      });

      // Send a success response upon successful user creation
      res.status(201).json({ message: "Successfully created a new user" });
    });
  } catch (error) {
    // Handle internal server errors and send an error response
    console.error("Add user failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Generate Access Token
 *
 * This function is responsible for generating an access token for a user, based on their ID and premium status. It uses the JSON Web Token (JWT) library to create the token.
 *
 * @param {number} id - The user's ID.
 * @param {boolean} ispremium - A boolean indicating whether the user is a premium user.
 *
 * @returns {string} The function returns a JWT access token.
 */
exports.generateAccessToken = (id, ispremium) => {
  return jwt.sign({ userId: id, ispremiumuser: ispremium }, secretkey);
};

/**
 * Login User
 *
 * This function is responsible for authenticating a user's login. It expects a POST request with 'email' and 'password' in the request body. It checks if a user with the provided email exists, compares the provided password with the stored hashed password, and issues an access token if the login is successful.
 *
 * @param {Object} req - The HTTP request object, which should contain 'email' and 'password' in the request body.
 * @param {Object} res - The HTTP response object used to send a success message with an access token or an error message.
 *
 * @throws {Error} If there is an internal server error during the login process.
 *
 * @returns {Object} The function sends an HTTP response with a success message and an access token upon successful login, or an error message with the appropriate status code.
 */
exports.loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Checking if the user with the provided email exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Comparing the provided password with the stored hashed password
    const tok = jwt.sign(
      { userId: user.id, ispremiumuser: user.ispremiumuser },
      secretkey
    );

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error("Wrong Password:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (result) {
        res.status(200).json({
          message: "User login successful",
          token: tok,
        });
      } else {
        res.status(401).json({ error: "User not authorized" });
      }
    });
  } catch (error) {
    // Handle internal server errors and send an error response
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
