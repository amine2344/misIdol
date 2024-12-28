const express = require("express");
const router = express.Router();
const styleController = require("../controllers/style.controllers");

// Routes pour la gestion des styles
router.get("/style", styleController.getAllStyles);
router.get("/style/:styleId", styleController.getStyleById);
router.post("/style", styleController.createStyle);
router.put("/style/:id_style", styleController.updateStyle);
router.delete("/style/:id_style", styleController.deleteStyle);

module.exports = router;
