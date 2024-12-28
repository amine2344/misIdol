const express = require("express");
const router = express.Router();
const {
  getAllTailles,
  getTailleById,
  createTaille,
  updateTaille,
  deleteTaille,
} = require("../controllers/taille.controllers");

// Obtenir toutes les tailles
router.get("/taille", getAllTailles);

// Obtenir une taille par ID
router.get("/taille/:id", getTailleById);

// Créer une nouvelle taille
router.post("/taille", createTaille);

// Mettre à jour une taille par ID
router.put("/taille/:id", updateTaille);

// Supprimer une taille par ID
router.delete("/taille/:id", deleteTaille);

module.exports = router;
