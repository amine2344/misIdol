const cors = require('cors');const express = require("express");
const router = express.Router();
const produitTailleController = require("../controllers/produit_taille.controllers");

// Route pour créer une association produit-taille
router.post("/produit-taille",cors(), produitTailleController.createProduitTaille);

// Route pour récupérer toutes les associations produit-taille
router.get("/produit-tailles",cors(), produitTailleController.getAllProduitTailles);

// Route pour récupérer une association produit-taille par ID
router.get(
  "/produit-taille/:tailleId/:produitId",cors(),
  produitTailleController.getProduitTailleById
);

// Route pour mettre à jour une association produit-taille
router.put(
  "/produit-taille/:tailleId/:produitId",cors(),
  produitTailleController.updateProduitTaille
);

// Route pour supprimer une association produit-taille
router.delete(
  "/produit-taille/:tailleId/:produitId",cors(),
  produitTailleController.deleteProduitTaille
);

router.get(
  "/produit/:productId/tailles",cors(),
  produitTailleController.getSizesByProductId
);

module.exports = router;
