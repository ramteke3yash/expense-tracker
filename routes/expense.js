const express = require("express");

const router = express.Router();
const Expense = require("../models/expense");

const expenseController = require("../controllers/expense");

router.post("/add-expense", expenseController.postExpense);

router.get("/get-expenses", expenseController.getExpense);

router.delete("/delete-expense/:id", expenseController.deleteExpense);

router.put("/edit-expense/:id", expenseController.editExpense);

module.exports = router;
