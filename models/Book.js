const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Book = sequelize.define(
  "Book",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("best_practices", "case_studies", "research_papers", "e_book"),
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING, // Stores the file path
      allowNull: false,
    },
    pdfFile: {
      type: DataTypes.STRING, // Stores the file path
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Synchronize the model with the database
Book.sync({ alter: true })
  .then(() => console.log("Book table synced successfully."))
  .catch((err) => console.error("Error syncing Book table:", err));

module.exports = Book;
