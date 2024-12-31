const express = require("express");
const router = express.Router();
const livraisonController = require("../controllers/livraison.controller");
const cors = require('cors');

// Route pour créer une livraison
router.post("/livraison/:idOrder",cors(), livraisonController.createLivraison);

// Route pour obtenir toutes les livraisons
router.get("/livraison", cors(),livraisonController.getAllLivraisons);

// Route pour obtenir une livraison par ID
router.get("/livraison/:id", cors(),livraisonController.getLivraisonById);

// Route pour mettre à jour une livraison
router.put("/livraison/:id",cors(), livraisonController.updateLivraison);

// Route pour supprimer une livraison
router.delete("/livraison/:id",cors(), livraisonController.deleteLivraison);

module.exports = router;
