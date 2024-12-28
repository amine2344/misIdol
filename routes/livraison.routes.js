const express = require("express");
const router = express.Router();
const livraisonController = require("../controllers/livraison.controller");

// Route pour créer une livraison
router.post("/livraison/:idOrder", livraisonController.createLivraison);

// Route pour obtenir toutes les livraisons
router.get("/livraison", livraisonController.getAllLivraisons);

// Route pour obtenir une livraison par ID
router.get("/livraison/:id", livraisonController.getLivraisonById);

// Route pour mettre à jour une livraison
router.put("/livraison/:id", livraisonController.updateLivraison);

// Route pour supprimer une livraison
router.delete("/livraison/:id", livraisonController.deleteLivraison);

module.exports = router;
