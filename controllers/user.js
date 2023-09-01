const User = require("../models/user");

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

    const data = await User.create({
      name: name,
      email: email,
      password: password,
    });
    res.status(201).json({ newUserDetail: data });
  } catch (error) {
    console.error("Add user failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      // Incorrect password
      return res.status(401).json({ error: "User not authorized" });
    }

    // Password matches, send success response
    res.status(200).json({ message: "User login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
