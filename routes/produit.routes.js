const db = require("../utils/db_config");
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

//get produit table  lengh 
router.get("/produit-count", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT COUNT(*) AS count FROM produit");
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({ error: "Database error" });
  }
});

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
