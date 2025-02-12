const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 9000000 }, // 9 MB limit
    fileFilter: (req, file, cb) => {
        cb(null, true); // Accept all file types
    }
});

module.exports = upload;