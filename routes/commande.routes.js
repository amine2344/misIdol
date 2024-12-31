// routes/commandeRoutes.js
const cors = require('cors');
const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commande.controllers");

// Route pour créer une nouvelle commande
router.post("/commande",  cors(),commandeController.createCommande);

// Route pour obtenir toutes les commandes
router.get("/commandes",  cors(),commandeController.getAllCommandes);

// Route pour obtenir une commande par ID
router.get("/commande/:id",  cors(),commandeController.getCommandeById);

// Route pour mettre à jour une commande
router.put("/commande/:id",  cors(),commandeController.updateCommande);

// Route pour supprimer une commande
router.delete("/commande/:id",  cors(),commandeController.deleteCommande);

module.exports = router;
