const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");
const S3Service = require("../services/S3services");
const DownloadHistory = require("../models/downloadHistory");

exports.fetchDownloadHistory = async (req, res) => {
  try {
    const user = req.user;
    // Fetch the download history for the user
    const downloadHistory = await DownloadHistory.findAll({
      where: { userId: user.id },
    });

    res.status(200).json({ downloadHistory });
  } catch (error) {
    console.error("Fetch download history failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.downloadexpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.findAll({ where: { userId } });
    const stringifiedExpenses = JSON.stringify(expenses);

    const filename = `Expense${userId}/${new Date()}.txt`;
    // const timestamp = new Date().toISOString().replace(/:/g, "-");
    // const filename = `Expense${userId}/${timestamp}.txt`;

    const fileURL = await S3Service.uploadToS3(stringifiedExpenses, filename);

    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    console.log("Download expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.postExpense = async (req, res, next) => {
  let t = await sequelize.transaction();
  try {
    const { amount, description, category } = req.body;

    if (amount == undefined || amount.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Parameters missing!" });
    }

    // Create the new expense
    const newExpense = await Expense.create({
      amount: amount,
      description: description,
      category: category,
      userId: req.user.dataValues.id,
    });

    // Calculate the new totalExpense
    const user = req.user;
    const totalExpense = Number(user.totalExpenses) + Number(amount);

    // Update the user's total expenses
    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();
    res.status(201).json({ newExpenseDetail: newExpense });
  } catch (error) {
    await t.rollback();
    console.log("Add expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    //console.log(">>>>>1", expenses);
    res.status(200).json({ allExpenses: expenses });
  } catch (error) {
    console.log("get expense is failing", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  const eId = req.params.id;

  try {
    const deletedExpense = await Expense.findOne({
      where: { id: eId, userId: req.user.id },
    });

    const deletedAmount = deletedExpense.amount;

    // Delete the expense
    await Expense.destroy({ where: { id: eId, userId: req.user.id } });

    // Update the user's total expenses
    const user = req.user;
    const totalExpense = Number(user.totalExpenses) - Number(deletedAmount);

    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id } }
    );

    res.sendStatus(200);
  } catch (error) {
    console.log("Delete expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.editExpense = async (req, res) => {
  const eId = req.params.id;
  const { amount, description, category } = req.body;

  try {
    const expense = await Expense.findByPk(eId);

    // Calculate the difference between the new amount and the old amount
    const oldAmount = expense.amount;
    const amountDifference = Number(amount) - Number(oldAmount);

    // Update the expense fields
    expense.amount = amount;
    expense.description = description;
    expense.category = category;
    await expense.save();

    // Update the user's total expenses
    const user = req.user;
    const totalExpense = Number(user.totalExpenses) + amountDifference;

    await User.update(
      { totalExpenses: totalExpense },
      { where: { id: req.user.id } }
    );

    res.status(200).json({ updatedExpense: expense });
  } catch (error) {
    console.log("Edit expense failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
