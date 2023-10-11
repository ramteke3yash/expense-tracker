const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user");

const DownloadHistory = sequelize.define("downloadHistory", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  downloadDate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = DownloadHistory;
