const express = require("express");
const cors = require('cors');
const router = express.Router();
const {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
} = require("../controllers/produit.controllers");

// Obtenir tous les produits
router.get("/produit",cors(), getAllProduits);

// Obtenir un produit par ID
router.get("/produit/:id", cors(),getProduitById);

// Créer un nouveau produit
router.post("/produit",cors(), createProduit);

// Mettre à jour un produit par ID
router.put("/produit/:id",cors(), updateProduit);

// Supprimer un produit par ID
router.delete("/produit/:id",cors(), deleteProduit);

module.exports = router;
