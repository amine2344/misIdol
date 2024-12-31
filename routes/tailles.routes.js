const express = require("express");
const cors = require('cors');
const router = express.Router();
const {
  getAllTailles,
  getTailleById,
  createTaille,
  updateTaille,
  deleteTaille,
} = require("../controllers/taille.controllers");

// Obtenir toutes les tailles
router.get("/taille",cors(), getAllTailles);

// Obtenir une taille par ID
router.get("/taille/:id",cors(), getTailleById);

// Créer une nouvelle taille
router.post("/taille",cors(), createTaille);

// Mettre à jour une taille par ID
router.put("/taille/:id",cors(), updateTaille);

// Supprimer une taille par ID
router.delete("/taille/:id", cors(),deleteTaille);

module.exports = router;
