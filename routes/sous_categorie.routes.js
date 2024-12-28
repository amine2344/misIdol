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
router.post("/sous-categorie", createSousCategorie);

// Route pour récupérer une sous-catégorie par ID
router.get("/sous-categorie/:id", getSousCategorieById);

router.get("/sous-categorie", getAllSousCategorie);

// Route pour mettre à jour une sous-catégorie
router.put("/sous-categorie/:id", updateSousCategorie);

// Route pour supprimer une sous-catégorie
router.delete("/sous-categorie/:id", deleteSousCategorie);

module.exports = router;
