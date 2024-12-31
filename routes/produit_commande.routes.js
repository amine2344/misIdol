const express = require("express");
const cors = require('cors');
const router = express.Router();
const produitCommandeController = require("../controllers/produit_commande.controllers");

// Route pour créer une association produit-commande
router.post(
  "/produit-commandes", cors(),
  produitCommandeController.createProduitCommande
);

// Route pour récupérer toutes les associations produit-commande
router.get(
  "/produit-commandes", cors(),
  produitCommandeController.getAllProduitCommandes
);

// Route pour récupérer une association produit-commande par id
router.get(
  "/produit-commandes/:commandeId/:produitId", cors(),
  produitCommandeController.getProduitCommandeById
);

// Route pour mettre à jour une association produit-commande
router.put(
  "/produit-commandes/:commandeId/:produitId", cors(),
  produitCommandeController.updateProduitCommande
);

// Route pour supprimer une association produit-commande
router.delete(
  "/produit-commandes/:commandeId/:produitId", cors(),
  produitCommandeController.deleteProduitCommande
);

module.exports = router;
