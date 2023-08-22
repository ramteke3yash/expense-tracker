const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const Expense = require("./models/expense");
const cors = require("cors");
const { error } = require("console");

const app = express();

const expenseRoutes = require("./routes/expense");

app.use(cors());
app.use(bodyParser.json());
app.use(expenseRoutes);

sequelize
  .sync()
  .then((result) => {
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
