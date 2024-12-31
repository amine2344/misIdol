const express = require("express");
const cors = require('cors');
const {
  createMaterielProduit,
  getAllMaterielProduits,
  getMaterielProduitById,
  updateMaterielProduit,
  deleteMaterielProduit,
  getMateriauxByProduitId,
} = require("../controllers/materiel_produit.controllers");

const router = express.Router();

// Routes pour gérer les associations matériel-produit
router.post("/materiel-produit", cors(),createMaterielProduit);
router.get("/materiel-produit",cors(), getAllMaterielProduits);
router.get("/materiel-produit/:materielId/:produitId",cors(), getMaterielProduitById);
router.put("/materiel-produit/:materielId/:produitId",cors(), updateMaterielProduit);
router.delete(
  "/materiel-produit/:materielId/:produitId",
  deleteMaterielProduit
);
// Route pour récupérer tous les matériaux associés à un produit spécifique
router.get("/produit/:produitId/materiaux", getMateriauxByProduitId);

module.exports = router;
