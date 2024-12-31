const cors = require('cors');
const express = require("express");
const router = express.Router();
const {
  createSousCategorie,
  getSousCategorieById,
  updateSousCategorie,
  deleteSousCategorie,
  getAllSousCategorie,
} = require("../controllers/sous_categorie.controllers");

// Route pour créer une sous-catégorie
router.post("/sous-categorie",cors(), createSousCategorie);

// Route pour récupérer une sous-catégorie par ID
router.get("/sous-categorie/:id",cors(), getSousCategorieById);

router.get("/sous-categorie",cors(), getAllSousCategorie);

// Route pour mettre à jour une sous-catégorie
router.put("/sous-categorie/:id",cors(), updateSousCategorie);

// Route pour supprimer une sous-catégorie
router.delete("/sous-categorie/:id",cors(), deleteSousCategorie);

module.exports = router;
