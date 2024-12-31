const express = require("express");
const router = express.Router();const cors = require('cors');
const produitTailleCouleurQuantiteController = require("../controllers/produitTailleCouleurQuantiteController");

// Route pour créer une nouvelle association produit-taille-couleur-quantité
router.post(
  "/produit-taille-couleur-quantite",cors(),
  produitTailleCouleurQuantiteController.createProduitTailleCouleurQuantite
);

// Route pour récupérer toutes les associations produit-taille-couleur-quantité
router.get(
  "/produit-taille-couleur-quantite",cors(),
  produitTailleCouleurQuantiteController.getAllProduitTailleCouleurQuantites
);

// Route pour récupérer une association spécifique produit-taille-couleur-quantité par produitId
router.get(
  "/produit-taille-couleur-quantite/:produitId",cors(),
  produitTailleCouleurQuantiteController.getProduitTailleCouleurQuantiteByProduitId
);

// Route pour mettre à jour une association produit-taille-couleur-quantité
router.put(
  "/produit-taille-couleur-quantite",cors(),
  produitTailleCouleurQuantiteController.updateProduitTailleCouleurQuantite
);

// Route pour supprimer une association produit-taille-couleur-quantité
router.delete(
  "/produit-taille-couleur-quantite",cors(),
  produitTailleCouleurQuantiteController.deleteProduitTailleCouleurQuantite
);

module.exports = router;
