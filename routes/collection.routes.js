const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collection.controllers"); // Assurez-vous que le chemin est correct

// Récupérer toutes les collections
router.get("/collection", collectionController.getAllCollections);

// Récupérer une collection par ID
router.get("/collection/:id", collectionController.getCollectionById);

// Créer une nouvelle collection
router.post("/collection", collectionController.createCollection);

// Mettre à jour une collection
router.put("/collection/:id", collectionController.updateCollection);

// Supprimer une collection
router.delete("/collection/:id", collectionController.deleteCollection);

module.exports = router;
