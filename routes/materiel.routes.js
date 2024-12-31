const cors = require('cors');
const express = require("express");
const router = express.Router();
const {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
} = require("../controllers/materiel.controllers");

// Routes pour les matériels
router.get("/materiel",cors(), getAllMateriels); // Récupérer tous les matériels
router.get("/materiel/:id",cors(), getMaterielById); // Récupérer un matériel par ID
router.post("/materiel", cors(),createMateriel); // Créer un nouveau matériel
router.put("/materiel/:id", cors(),updateMateriel); // Mettre à jour un matériel
router.delete("/materiel/:id", cors(),deleteMateriel); // Supprimer un matériel

module.exports = router;
