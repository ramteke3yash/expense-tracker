const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sequelize = require("./util/database");
const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require("./models/order");

const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const purchaseRoutes = require("./routes/purchase");
const featureRoutes = require("./routes/premiumFeature");
const passwordRoutes = require('./routes/password');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/premium", featureRoutes);
app.use('/password', passwordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

sequelize
  .sync() // { force: true }
  .then(() => {
    app.listen(3000);
  });
