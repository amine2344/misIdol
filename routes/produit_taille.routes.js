const express = require("express");
const router = express.Router();
const produitTailleController = require("../controllers/produit_taille.controllers");

// Route pour créer une association produit-taille
router.post("/produit-taille", produitTailleController.createProduitTaille);

// Route pour récupérer toutes les associations produit-taille
router.get("/produit-tailles", produitTailleController.getAllProduitTailles);

// Route pour récupérer une association produit-taille par ID
router.get(
  "/produit-taille/:tailleId/:produitId",
  produitTailleController.getProduitTailleById
);

// Route pour mettre à jour une association produit-taille
router.put(
  "/produit-taille/:tailleId/:produitId",
  produitTailleController.updateProduitTaille
);

// Route pour supprimer une association produit-taille
router.delete(
  "/produit-taille/:tailleId/:produitId",
  produitTailleController.deleteProduitTaille
);

router.get(
  "/produit/:productId/tailles",
  produitTailleController.getSizesByProductId
);

module.exports = router;
