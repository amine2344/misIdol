const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/photos/";

    // Créer le répertoire si nécessaire
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${uniqueSuffix}-${originalName}`;
    cb(null, fileName);
  },
});

// Initialisation de Multer avec les paramètres définis
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
