const Expense = require("../models/expense");

exports.postExpense = async (req, res, next) => {
  try {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;

    const data = await Expense.create({
      amount: amount,
      description: description,
      category: category,
    });
    res.status(201).json({ newExpenseDetail: data });
  } catch (error) {
    console.log("add expense is failing", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json({ allExpenses: expenses });
  } catch (error) {
    console.log("get expense is failing", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  const eId = req.params.id;
  await Expense.destroy({ where: { id: eId } });
  res.sendStatus(200);
};

exports.editExpense = async (req, res) => {
  const eId = req.params.id;
  const { amount, description, category } = req.body;

  try {
    const expense = await Expense.findByPk(eId);
    if (!expense) {
      return res.status(404).json({ error: "expense not found" });
    }

    expense.amount = amount;
    expense.description = description;
    expense.category = category;
    await expense.save();

    res.status(200).json({ updatedExpense: expense });
  } catch (error) {
    console.log("edit expense is failing", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
