const express = require("express");

const router = express.Router();
const Expense = require("../models/expense");

const expenseController = require("../controllers/expense");
const userauthentication = require("../middleware/auth");

router.post(
  "/add-expense",
  userauthentication.authenticate,
  expenseController.postExpense
);

router.get(
  "/get-expenses",
  userauthentication.authenticate,
  expenseController.getExpense
);

router.delete(
  "/delete-expense/:id",
  userauthentication.authenticate,
  expenseController.deleteExpense
);

router.put(
  "/edit-expense/:id",
  userauthentication.authenticate,
  expenseController.editExpense
);

module.exports = router;
