const cors = require('cors');
const express = require("express");
const router = express.Router();
const collectionController = require("../controllers/collection.controllers"); // Assurez-vous que le chemin est correct

// Récupérer toutes les collections
router.get("/collection",  cors(),collectionController.getAllCollections);

// Récupérer une collection par ID
router.get("/collection/:id", cors(), collectionController.getCollectionById);

// Créer une nouvelle collection
router.post("/collection",  cors(),collectionController.createCollection);

// Mettre à jour une collection
router.put("/collection/:id",  cors(),collectionController.updateCollection);

// Supprimer une collection
router.delete("/collection/:id",  cors(),collectionController.deleteCollection);

module.exports = router;
