const express = require("express");

const router = express.Router();
const Expense = require("../models/expense");

const expenseController = require("../controllers/expense");

router.post("/expense/add-expense", expenseController.postExpense);

router.get("/expense/get-expenses", expenseController.getExpense);

router.delete("/expense/delete-expense/:id", expenseController.deleteExpense);

router.put("/expense/edit-expense/:id", expenseController.editExpense);

module.exports = router;
