const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");
const S3Service = require("../services/S3services");
const DownloadHistory = require("../models/downloadHistory");

/**
 * Save Download History
 *
 * This function is responsible for saving download history to the database. It expects a POST request with a JSON body containing 'fileURL' and 'userId'. It creates a new record in the 'DownloadHistory' table in the database with the provided 'fileURL' and 'userId'.
 *
 * @param {Object} req - The HTTP request object containing the request parameters and body.
 * @param {Object} res - The HTTP response object used to send the response back to the client.
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing either a success message or an error message.
 */

exports.saveDownloadHistory = async (req, res) => {
  try {
    // Extract 'fileURL' and 'userId' from the request body
    const { fileURL, userId } = req.body;

    // Save download history to the database
    const downloadHistory = await DownloadHistory.create({
      fileUrl: fileURL,
      userId: userId,
    });

    if (downloadHistory) {
      // Send a success response if the download history is saved successfully
      res.status(200).json({
        success: true,
        message: "Download history saved successfully",
      });
    } else {
      // Send an error response if there was a problem saving the download history
      res
        .status(400)
        .json({ success: false, message: "Failed to save download history" });
    }
  } catch (error) {
    // handle internal server errors and send an eror response
    console.error("Save download history failed:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

/**
 * Fetch Download History
 *
 * This function is responsible for retrieving the download history for a specific user. It expects an authenticated user to be available in the 'req' object, and it fetches download history records associated with that user from the database.
 *
 * @param {Object} req - The HTTP request object, which should contain an authenticated user in the 'user' property.
 * @param {Object} res - The HTTP response object used to send the download history back to the client.
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing the user's download history or an error message.
 */

exports.fetchDownloadHistory = async (req, res) => {
  try {
    // Extract the authenticated user from the request
    const user = req.user;

    // Fetch the download history for the user from the database
    const downloadHistory = await DownloadHistory.findAll({
      where: { userId: user.id },
    });

    // Send a success response with the download history
    res.status(200).json({ downloadHistory });
  } catch (error) {
    // Handle internal server errors and send an error response
    console.error("Fetch download history failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Download Expense Data
 *
 * This function is responsible for fetching and exporting a user's expense data as a JSON file. It retrieves expenses associated with the authenticated user from the database, converts them to a JSON format, and then uploads the JSON file to an external service (e.g., S3). It returns the URL to the uploaded JSON file in the response.
 *
 * @param {Object} req - The HTTP request object, containing the authenticated user in the 'user' property.
 * @param {Object} res - The HTTP response object used to send the URL of the downloaded JSON file.
 * @param {function} next - The next function for passing control to the next middleware (if applicable).
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing the URL of the downloaded JSON file or an error message.
 */

exports.downloadexpense = async (req, res, next) => {
  try {
    // Extract the authenticated user's ID from the request
    const userId = req.user.id;

    // Fetch expenses to a JSON string
    const expenses = await Expense.findAll({ where: { userId } });

    // Convert expenses to a JSON string
    const stringifiedExpenses = JSON.stringify(expenses);

    // Generate a unique filename for the exported JSON file
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const filename = `Expense${userId}_${timestamp}.txt`;

    // Upload the JSON data to an external service (e.g, S3)
    const fileURL = await S3Service.uploadToS3(stringifiedExpenses, filename);

    // Send a success response with the URL of the downloaded JSON file
    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    // Handle internal server errors and send an error response
    console.log("Download expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Post an Expense
 *
 * This function is responsible for creating a new expense entry in the database. It expects a POST request with JSON data containing 'amount', 'description', and 'category' for the new expense. It also updates the user's total expenses. If any of the required parameters are missing, it returns a 400 Bad Request response.
 *
 * @param {Object} req - The HTTP request object, which should contain the 'amount', 'description', 'category', and an authenticated user in the 'user' property.
 * @param {Object} res - The HTTP response object used to send a success message or an error message.
 * @param {function} next - The next function for passing control to the next middleware (if applicable).
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing the details of the newly created expense or an error message.
 */

exports.postExpense = async (req, res, next) => {
  let t = await sequelize.transaction();
  try {
    // Extract 'amount', 'description' and 'category' from the request body
    const { amount, description, category } = req.body;

    if (amount == undefined || amount.length === 0) {
      // Check if 'amount' is missing or empty and return a bad request response
      return res
        .status(400)
        .json({ success: false, message: "Parameters missing!" });
    }

    // Create the new expense in the database
    const newExpense = await Expense.create({
      amount: amount,
      description: description,
      category: category,
      userId: req.user.dataValues.id,
    });

    // Calculate the new totalExpense
    const user = req.user;
    const totalExpense = Number(user.totalExpenses) + Number(amount);

    // Updating the user's total expenses in the database
    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    // Commit the transaction and send a success response with the new expense details
    await t.commit();
    res.status(201).json({ newExpenseDetail: newExpense });
  } catch (error) {
    // Rollback the transaction and handle internal server errors, then send an error response
    await t.rollback();
    console.log("Add expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get User's Expenses
 *
 * This function is responsible for retrieving all expenses associated with a specific user. It fetches expense records from the database that match the user's ID and returns them as a JSON response.
 *
 * @param {Object} req - The HTTP request object, which should contain an authenticated user in the 'user' property.
 * @param {Object} res - The HTTP response object used to send the user's expenses.
 * @param {function} next - The next function for passing control to the next middleware (if applicable).
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing all expenses associated with the user or an error message.
 */

exports.getExpense = async (req, res, next) => {
  try {
    // Retrieve all expenses associated with the user's ID from the database
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });

    // Send a success response with all expenses
    res.status(200).json({ allExpenses: expenses });
  } catch (error) {
    // Handle internal server errors and send an error response
    console.log("get expense is failing", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete an Expense
 *
 * This function is responsible for deleting an expense associated with a specific user. It expects a DELETE request with the 'id' parameter in the URL to identify the expense to be deleted. If the expense exists and belongs to the user, it will be deleted from the database, and the user's total expenses will be updated accordingly.
 *
 * @param {Object} req - The HTTP request object, which should contain the 'id' parameter in the URL and an authenticated user in the 'user' property.
 * @param {Object} res - The HTTP response object used to send a success status (200) or an error message.
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a success status (200) if the expense is deleted successfully, or an error message with the appropriate status code.
 */

exports.deleteExpense = async (req, res) => {
  const eId = req.params.id;

  let t = await sequelize.transaction();

  try {
    // Find the expense to be deleted based on 'id' and 'userId'
    const deletedExpense = await Expense.findOne({
      where: { id: eId, userId: req.user.id },
      transaction: t,
    });

    if (!deletedExpense) {
      // If the expense doesn't exist, roll back the transaction and return a not found response
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    const deletedAmount = deletedExpense.amount;

    // Delete the expense from the database
    await Expense.destroy({
      where: { id: eId, userId: req.user.id },
      transaction: t,
    });

    // Updating the user's total expenses
    const user = req.user;
    const totalExpense = Number(user.totalExpenses) - Number(deletedAmount);

    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    // Commit the transaction and send a success status (200)
    await t.commit();
    res.sendStatus(200);
  } catch (error) {
    // Rollback the transaction and handle internal server errors, then send an error response
    await t.rollback();
    console.log("Delete expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Edit an Expense
 *
 * This function is responsible for updating an existing expense associated with a specific user. It expects a PUT request with the 'id' parameter in the URL to identify the expense to be edited, and JSON data in the request body containing the new 'amount', 'description', and 'category' for the expense. If the expense exists and belongs to the user, it will be updated in the database, and the user's total expenses will be adjusted accordingly.
 *
 * @param {Object} req - The HTTP request object, which should contain the 'id' parameter in the URL and the updated expense details in the request body, as well as an authenticated user in the 'user' property.
 * @param {Object} res - The HTTP response object used to send a success status (200) or an error message.
 *
 * @throws {Error} If there is an internal server error during the process.
 *
 * @returns {Object} The function sends an HTTP response with a JSON object containing the updated expense details if the update is successful, or an error message with the appropriate status code.
 */

exports.editExpense = async (req, res) => {
  const eId = req.params.id;
  const { amount, description, category } = req.body;

  let t = await sequelize.transaction();

  try {
    // Find the expense to be edited based on 'id' and within the transaction
    const expense = await Expense.findByPk(eId, { transaction: t });

    if (!expense) {
      // If the expense doesn't exist, rollback the transaction and return a not found response
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    // Calculate the difference between the new amount and the old amount
    const oldAmount = expense.amount;
    const amountDifference = Number(amount) - Number(oldAmount);

    // Update the expense details
    expense.amount = amount;
    expense.description = description;
    expense.category = category;

    // Save the updated expense within the transaction
    await expense.save({ transaction: t });

    // Updating the user's total expenses
    const user = req.user;
    const totalExpense = Number(user.totalExpenses) + amountDifference;

    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    // Commit the transaction and send a success response with the updated expense details
    await t.commit();
    res.status(200).json({ updatedExpense: expense });
  } catch (error) {
    // Roll back the transaction and handle internal server errors, then send an error response
    await t.rollback();
    console.log("Edit expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
