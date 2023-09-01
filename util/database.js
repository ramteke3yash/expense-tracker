const Sequelize = require("sequelize");

const sequelize = new Sequelize("expense-app", "root", "lion", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
