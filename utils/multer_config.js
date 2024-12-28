const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Fonction pour nettoyer les noms de fichiers
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_"); // Remplace les caractères non alphanumériques
};

// Filtre pour valider les types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"), false);
  }
};

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.resolve(__dirname, "../uploads/photos"); // Chemin absolu
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const sanitizedFileName = sanitizeFileName(file.originalname);
    cb(null, Date.now() + "-" + sanitizedFileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5 Mo
  fileFilter: fileFilter,
});

module.exports = upload;
