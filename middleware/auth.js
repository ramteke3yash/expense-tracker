const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    //console.log("this is a token-->", token);

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = jwt.verify(token, process.env.secretkey);
    //console.log("user id >>>>", user.userId); ///error?

    User.findByPk(user.userId).then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
      // console.log("this is a user", user);

      req.user = user;
      //console.log("authen is working");
      next();
    });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ success: false, message: "Token is invalid" });
  }
};

module.exports = { authenticate };
