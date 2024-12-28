const express = require("express");
const router = express.Router();
const {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
} = require("../controllers/produit.controllers");

// Obtenir tous les produits
router.get("/produit", getAllProduits);

// Obtenir un produit par ID
router.get("/produit/:id", getProduitById);

// Créer un nouveau produit
router.post("/produit", createProduit);

// Mettre à jour un produit par ID
router.put("/produit/:id", updateProduit);

// Supprimer un produit par ID
router.delete("/produit/:id", deleteProduit);

module.exports = router;
