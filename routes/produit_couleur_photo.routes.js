const express = require("express");
const router = express.Router();
const produitCouleurPhotoController = require("../controllers/produit_couleur_photo.controllers");

// Route pour créer une nouvelle association produit-couleur-photo
router.post(
  "/produit-couleur-photo",
  produitCouleurPhotoController.createProduitCouleurPhoto
);

// Route pour récupérer toutes les associations produit-couleur-photo
router.get(
  "/produit-couleur-photo",
  produitCouleurPhotoController.getAllProduitCouleurPhotos
);

// Route pour récupérer une association spécifique produit-couleur-photo par produitId
router.get(
  "/produit-couleur-photo/:produitId",
  produitCouleurPhotoController.getProduitCouleurPhotoByProduitId
);

// Route pour supprimer une association produit-couleur-photo
router.delete(
  "/produit-couleur-photo",
  produitCouleurPhotoController.deleteProduitCouleurPhoto
);

module.exports = router;
