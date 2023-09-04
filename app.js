const express = require("express");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");

const Expense = require("./models/expense");
const User = require("./models/user");

const cors = require("cors");
const { error } = require("console");

const app = express();

const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");

app.use(cors());
app.use(bodyParser.json());
app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
//app.use(userRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize //{ force: true }
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
