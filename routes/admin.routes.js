
const cors = require('cors');
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controllers"); // Assurez-vous d'avoir le bon chemin vers votre contrôleur

// Route pour créer un administrateur
router.post("/admin",cors(),  adminController.createAdmin);

// Route pour récupérer tous les administrateurs
router.get("/admins",cors(),  adminController.getAllAdmins);

// Route pour récupérer un administrateur par ID
router.get("/admin/:id",cors(),  adminController.getAdminById);

// Route pour mettre à jour un administrateur par ID
router.put("/admin/:id_admin",cors(),  adminController.updateAdmin);

// Route pour supprimer un administrateur par ID
router.delete("/admin/:id_admin",cors(),  adminController.deleteAdmin);

module.exports = router;
