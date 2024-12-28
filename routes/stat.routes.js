const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stat.controllers");

// Route pour obtenir le nombre de messages reçus par mois
router.get("/messages-by-month", statsController.getMessagesByMonth);

// Route pour obtenir les pays avec le plus d'interactions
router.get("/countries-interactions", statsController.getCountriesInteractions);

// Route pour obtenir le nombre de clients par réseau social
router.get(
  "/clients-by-recognition",
  statsController.getClientsByReconnaissance
);

module.exports = router;
