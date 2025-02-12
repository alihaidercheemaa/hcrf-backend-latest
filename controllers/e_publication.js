const Book = require("../models/Book");
const fs = require("fs");
const path = require("path");

// Serve static files from "uploads" directory
const express = require("express");
const app = express();
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create a new book
exports.createBook = async (req, res) => {
    try {
        if (!req.files || !req.files.cover || !req.files.pdf) {
            return res.status(400).json({ message: "Cover image and book PDF are required" });
        }

        const { title, author, category } = req.body;
        const validCategories = ["best_practices", "case_studies", "research_papers", "e_book"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const coverImage = req.files.cover[0].filename;
        const pdfFile = req.files.pdf[0].filename;

        const book = await Book.create({ title, author, category, coverImage, pdfFile });
        res.status(201).json({ message: "Book added successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Error adding book", error: error.message });
    }
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.findAll({
            attributes: ["id", "title", "author", "category", "coverImage", "pdfFile"],
        });

        // Clean file paths
        const formattedBooks = books.map((book) => ({
            ...book.toJSON(),
            coverImage: `uploads/${book.coverImage}`,
            pdfFile: `uploads/${book.pdfFile}`,
        }));

        res.status(200).json(formattedBooks);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
};

// Get books by category
exports.getBooksByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ["best_practices", "case_studies", "research_papers", "e_book"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const books = await Book.findAll({
            where: { category },
            attributes: ["id", "title", "coverImage"],
        });

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
};

// Get book details
// exports.getBookDetails = async (req, res) => {
//     try {
//         if (!req.user || !req.user.isMember) {
//             return res.status(403).json({ message: "Access denied. Members only" });
//         }

//         const { id } = req.params;
//         const book = await Book.findByPk(id);

//         if (!book) return res.status(404).json({ message: "Book not found" });

//         res.status(200).json(book);
//     } catch (error) {
//         res.status(500).json({ message: "Error retrieving book", error: error.message });
//     }
// };

exports.getBookDetails = async (req, res) => {
    try {
        // ❌ REMOVE THIS CHECK
        // if (!req.user || !req.user.isMember) {
        //     return res.status(403).json({ message: "Access denied. Members only" });
        // }

        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) return res.status(404).json({ message: "Book not found" });

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book", error: error.message });
    }
};


// Update book
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, category } = req.body;
        const book = await Book.findByPk(id);

        if (!book) return res.status(404).json({ message: "Book not found" });

        if (category && !["best_practices", "case_studies", "research_papers", "e_book"].includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        if (req.files.cover) {
            fs.unlinkSync(path.join(__dirname, "../uploads", book.coverImage)); // Delete old cover
            book.coverImage = req.files.cover[0].filename;
        }

        if (req.files.pdf) {
            fs.unlinkSync(path.join(__dirname, "../uploads", book.pdfFile)); // Delete old PDF
            book.pdfFile = req.files.pdf[0].filename;
        }

        book.title = title || book.title;
        book.author = author || book.author;
        book.category = category || book.category;
        await book.save();

        res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error.message });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) return res.status(404).json({ message: "Book not found" });

        fs.unlinkSync(path.join(__dirname, "../uploads", book.coverImage));
        fs.unlinkSync(path.join(__dirname, "../uploads", book.pdfFile));
        await book.destroy();

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error: error.message });
    }
};