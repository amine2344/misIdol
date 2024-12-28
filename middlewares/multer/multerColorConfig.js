// config/multer_config.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/photos/colors";
    createDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${uniqueSuffix}-${originalName}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return cb(new Error("Seules les images sont autorisées"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite de taille à 2MB
});

module.exports = upload;
