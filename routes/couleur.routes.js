const cors = require('cors');
// routes/couleurRoutes.js
const express = require("express");
const upload = require("../middlewares/multer/multerColorConfig");
const {
  createCouleur,
  updateCouleur,
  deleteCouleur,
  getAllCouleurs,
  getCouleurById,
} = require("../controllers/couleur.controllers");

const router = express.Router();

// Routes pour les couleurs
router.post("/couleur", upload.single("photo"), createCouleur); // Créer une nouvelle couleur
router.put("/couleur/:id", upload.single("photo"), updateCouleur); // Mettre à jour une couleur
router.delete("/couleur/:id", deleteCouleur); // Supprimer une couleur
router.get("/couleur", getAllCouleurs); // Obtenir toutes les couleurs
router.get("/couleur/:id", getCouleurById); // Obtenir une couleur par ID

module.exports = router;
