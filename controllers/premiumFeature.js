const User = require("../models/user");
const Expense = require("../models/expense");
const sequelize = require("../util/database");

/**
 * Get User Leaderboard
 *
 * This function is responsible for retrieving a leaderboard of users ranked by their total expenses in descending order. It queries the database to fetch users and their total expenses, orders them by total expenses in descending order, and returns the leaderboard as a JSON response.
 *
 * @param {Object} req - The HTTP request object, which does not require any specific data.
 * @param {Object} res - The HTTP response object used to send the user leaderboard.
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON array containing users ranked by total expenses or an error message.
 */

exports.getUserLeaderBoard = async (req, res) => {
  try {
    // Retrieve a leaderboard of users ordered by total expenses in descending order
    const leaderboardofusers = await User.findAll({
      order: [["totalExpenses", "DESC"]],
    });

    // Send a success response with the user leaderboard
    res.status(200).json(leaderboardofusers);
  } catch (err) {
    // Handle internal server errors and send an error response
    console.log(err);
    res.status(500).json(err);
  }
};
