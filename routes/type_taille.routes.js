const cors = require('cors');
const express = require("express");
const router = express.Router();
const {
  getAllTypeTailles,
  getTypeTailleById,
  createTypeTaille,
  updateTypeTaille,
  deleteTypeTaille,
} = require("../controllers/type_taille.controllers");

// Obtenir tous les types de taille
router.get("/type-taille",cors(),  getAllTypeTailles);

// Obtenir un type de taille par ID
router.get("/type-taille/:id", cors(), getTypeTailleById);

// Créer un nouveau type de taille
router.post("/type-taille/", cors(), createTypeTaille);

// Mettre à jour un type de taille par ID
router.put("/type-taille/:id",cors(),  updateTypeTaille);

// Supprimer un type de taille par ID
router.delete("/type-taille/:id", cors(), deleteTypeTaille);

module.exports = router;
