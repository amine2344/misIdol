const express = require("express");
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
router.post("/materiel-produit", createMaterielProduit);
router.get("/materiel-produit", getAllMaterielProduits);
router.get("/materiel-produit/:materielId/:produitId", getMaterielProduitById);
router.put("/materiel-produit/:materielId/:produitId", updateMaterielProduit);
router.delete(
  "/materiel-produit/:materielId/:produitId",
  deleteMaterielProduit
);
// Route pour récupérer tous les matériaux associés à un produit spécifique
router.get("/produit/:produitId/materiaux", getMateriauxByProduitId);

module.exports = router;
