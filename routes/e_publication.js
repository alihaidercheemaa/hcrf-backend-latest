const express = require('express');
const {
  createBook,
  getBooksByCategory,
  getBookDetails,
  updateBook,
  deleteBook,
  getAllBooks
} = require('../controllers/e_publication');

const upload = require('../config/multerConfig'); // Multer for file uploads
// const { protect, admin } = require('../middleware/auth'); // ❌ Comment out middleware for now

const router = express.Router();

// ✅ Public routes (No authentication middleware)
router.get('/', getAllBooks);
router.get('/:category', getBooksByCategory);
router.get('/details/:id', getBookDetails); // ❌ Removed authentication requirement

// ✅ Admin-only routes (Temporarily removing protection)
router.post('/', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), createBook);
router.put('/:id', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), updateBook);
router.delete('/:id', deleteBook);

// ✅ Serve PDFs correctly
router.get("/pdf/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");

  res.sendFile(filePath, (err) => {
      if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error loading PDF");
      }
  });
});

module.exports = router;
