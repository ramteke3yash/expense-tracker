const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/auth");
require("dotenv").config();

const secretkey = process.env.secretkey;

exports.signinUser = async (req, res, next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

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

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      console.log(existingUser);
      return res.status(409).json({ error: "User already exists" });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      const data = await User.create({
        name: name,
        email: email,
        password: hash,
      });
      res.status(201).json({ message: "Successfully created a new user" });
    });
  } catch (error) {
    console.error("Add user failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.generateAccessToken = (id, ispremium) => {
  return jwt.sign({ userId: id, ispremiumuser: ispremium }, secretkey);
};

exports.loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // Check if the user with the provided email exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided password with the stored hashed password
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
        //correct password
        console.log("this is user id>>>", user.id);
        res.status(200).json({
          message: "User login successful",
          token: tok,
        });
      } else {
        // Incorrect password
        res.status(401).json({ error: "User not authorized" });
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
