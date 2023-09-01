const User = require("../models/user");

exports.postUser = async (req, res, next) => {
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
    const existingUser = await User.findOne({ email });

    if (existingUser) {
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
