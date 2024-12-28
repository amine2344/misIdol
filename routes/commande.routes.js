// routes/commandeRoutes.js
const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/commande.controllers");

// Route pour créer une nouvelle commande
router.post("/commande", commandeController.createCommande);

// Route pour obtenir toutes les commandes
router.get("/commandes", commandeController.getAllCommandes);

// Route pour obtenir une commande par ID
router.get("/commande/:id", commandeController.getCommandeById);

// Route pour mettre à jour une commande
router.put("/commande/:id", commandeController.updateCommande);

// Route pour supprimer une commande
router.delete("/commande/:id", commandeController.deleteCommande);

module.exports = router;
