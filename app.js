const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { v4: uuidv4 } = require("uuid");

const sequelize = require("./util/database");
const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require("./models/order");
const ForgotPasswordRequests = require("./models/forgotPassword");
const DownloadHistory = require("./models/downloadHistory");

const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const purchaseRoutes = require("./routes/purchase");
const featureRoutes = require("./routes/premiumFeature");
const passwordRoutes = require("./routes/password");

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(cors());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/premium", featureRoutes);
app.use("/password", passwordRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(User);

User.hasMany(DownloadHistory);
DownloadHistory.belongsTo(User);

sequelize
  .sync() // { force: true }
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
