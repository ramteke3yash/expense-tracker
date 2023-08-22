const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "lion", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
