const Razorpay = require("razorpay");
const Order = require("../models/order");
const sequelize = require("../util/database");
const userController = require("./user");

/**
 * Purchase Premium
 *
 * This function is responsible for initiating the purchase of a premium service or product. It integrates with the Razorpay payment gateway to create an order for the specified amount. Upon successful order creation, it associates the order with the authenticated user and returns the order details along with the Razorpay key for client-side integration.
 *
 * @param {Object} req - The HTTP request object, which does not require any specific data.
 * @param {Object} res - The HTTP response object used to send the order details and the Razorpay key.
 *
 * @throws {Error} If there is an issue during the payment order creation process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing the order details and the Razorpay key for client-side integration or an error message.
 */
exports.purchasepremium = async (req, res) => {
  try {
    // Initialize Razorpay with API key and secret from environment variables
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // The amount to be charged (in INR)
    const amount = 2500;

    // Create a payment order using Razorpay
    const order = await new Promise((resolve, reject) => {
      rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });

    // Create an order record associated with the authenticated user in the database
    await req.user.createOrder({ orderid: order.id, status: "PENDING" });

    // Return a success response with the order details and the razorpay key for client-side integration
    return res.status(201).json({ order, key_id: rzp.key_id });
  } catch (err) {
    // Handle errors and return an error response
    console.error(err);
    return res
      .status(403)
      .json({ message: "Something went wrong", error: err });
  }
};

/**
 * Update Transaction Status
 *
 * This function is responsible for updating the status of a transaction associated with a user's order. It expects a POST request with a JSON body containing 'payment_id' and 'order_id'. Depending on the payment status and order existence, it updates the order status, the user's premium status, and generates a new access token if the transaction is successful.
 *
 * @param {Object} req - The HTTP request object, which should contain an authenticated user, 'payment_id', and 'order_id' in the request body.
 * @param {Object} res - The HTTP response object used to send a success message or an error message.
 *
 * @throws {Error} If there is an issue during the transaction status update process.
 *
 * @returns {Object} The function sends an HTTP response with a success message and, in the case of a successful transaction, a new access token or an error message.
 */

exports.updateTransactionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_id, order_id } = req.body;
    const order = await Order.findOne({ where: { orderid: order_id } });

    if (order) {
      if (payment_id) {
        // Update the order status to 'SUCCESSFUL' and record the payment ID
        await order.update({ paymentid: payment_id, status: "SUCCESSFUL" });

        // Update the user's premium status to 'true'
        const isprime = await req.user.update({ ispremiumuser: true });

        // Generate a new access token with premium status
        const token = userController.generateAccessToken(userId, true);

        // Send a success response with a new access token
        res.status(202).json({
          success: true,
          message: "Transaction successful",
          token: token,
        });
      } else {
        // Update the order status to 'FAILED'
        await order.update({ status: "FAILED" });

        // Update the user's premium status to 'false'
        await req.user.update({ ispremiumuser: false });

        // Send a response indicating a failed transaction
        res.status(200).json({ success: false, message: "Transaction failed" });
      }
    } else {
      // Send a response indicating an invalid order
      res.status(400).json({ message: "Invalid order" });
    }
  } catch (err) {
    // Handle errors and return an error response
    return res
      .status(403)
      .json({ message: "Something went wrong", error: err });
  }
};
