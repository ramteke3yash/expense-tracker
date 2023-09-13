const express = require("express");

const purchaseController = require("../controllers/purchase");

const authenticatemiddleware = require("../middleware/auth");

const router = express.Router();

router.get(
  "/premiummember",
  authenticatemiddleware,
  purchaseController.purchasepremium
);

router.post(
  "/updatetransactionstatus",
  authenticatemiddleware,
  purchaseController.updateTransactionStatus
);

module.exports = router;
