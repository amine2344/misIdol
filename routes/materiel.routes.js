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
router.get("/materiel", getAllMateriels); // Récupérer tous les matériels
router.get("/materiel/:id", getMaterielById); // Récupérer un matériel par ID
router.post("/materiel", createMateriel); // Créer un nouveau matériel
router.put("/materiel/:id", updateMateriel); // Mettre à jour un matériel
router.delete("/materiel/:id", deleteMateriel); // Supprimer un matériel

module.exports = router;
