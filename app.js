const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { v4: uuidv4 } = require("uuid");
// const helmet = require("helmet");
//const compression = require("compression");
//const morgan = require("morgan");

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

// app.use(helmet());
//app.use(compression());
// app.use(morgan("combined", { stream: accessLogStream }));
// app.use(cors({ origin: ["http://13.238.4.178/", "http://127.0.0.1:5500"] }));

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "script-src 'self' cdnjs.cloudflare.com 'unsafe-inline''nonce-your-random-nonce'"
//   );
//   next();
// });
app.use(cors());

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; font-src 'self'; connect-src 'self' http://13.238.4.178:3000/expense/get-expenses; img-src 'self'; script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.0/axios.min.js https://checkout.razorpay.com/v1/checkout.js; style-src 'self'; frame-src 'self' https://checkout.razorpay.com/v1/checkout.js  https://api.razorpay.com;"
  );
  next();
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/expense", expenseRoutes);
app.use("/user", userRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/premium", featureRoutes);
app.use("/password", passwordRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

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
