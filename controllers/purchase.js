const Razorpay = require("razorpay");
const Order = require("../models/order");
const sequelize  = require("../util/database");
const userController = require("./user");

exports.purchasepremium = async (req, res) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = 2500;

    const order = await new Promise((resolve, reject) => {
      rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });

    await req.user.createOrder({ orderid: order.id, status: "PENDING" });

    return res.status(201).json({ order, key_id: rzp.key_id });
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ message: "Something went wrong", error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_id, order_id } = req.body;
    const order = await Order.findOne({ where: { orderid: order_id } });

    if (order) {
      if (payment_id) {
        await order.update({ paymentid: payment_id, status: "SUCCESSFUL" });
        const isprime = await req.user.update({ ispremiumuser: true });
        const token = userController.generateAccessToken(userId, true);

        res.status(202).json({
          success: true,
          message: "Transaction successful",
          token: token,
        });
      } else {
        // If payment_id is not provided, consider it as a failed transaction
        await order.update({ status: "FAILED" });
        await req.user.update({ ispremiumuser: false });
        console.log(req.user);

        res.status(200).json({ success: false, message: "Transaction failed" });
      }
    } else {
      res.status(400).json({ message: "Invalid order" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ message: "Something went wrong", error: err });
  }
};
