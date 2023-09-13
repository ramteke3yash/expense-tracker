const express = require("express");

const router = express.Router();
const Expense = require("../models/expense");

const expenseController = require("../controllers/expense");
const userauthentication = require("../middleware/auth");

router.post("/add-expense", userauthentication, expenseController.postExpense);

router.get("/get-expenses", userauthentication, expenseController.getExpense);

router.delete(
  "/delete-expense/:id",
  userauthentication,
  expenseController.deleteExpense
);

router.put(
  "/edit-expense/:id",
  userauthentication,
  expenseController.editExpense
);

module.exports = router;
