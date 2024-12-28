const express = require("express");
const router = express.Router();
const {
  createCategorie,
  getAllCategories,
  getCategorieById,
  updateCategorie,
  deleteCategorie,
} = require("../controllers/categorie.controllers");

// Route pour créer une nouvelle catégorie
router.post("/categorie", createCategorie);

// Route pour récupérer toutes les catégories
router.get("/categorie", getAllCategories);

// Route pour récupérer une catégorie par son ID
router.get("/categorie/:id_cat", getCategorieById);

// Route pour mettre à jour une catégorie
router.put("/categorie/:id_cat", updateCategorie);

// Route pour supprimer une catégorie
router.delete("/categorie/:id_cat", deleteCategorie);

module.exports = router;
