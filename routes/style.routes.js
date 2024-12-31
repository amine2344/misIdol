const express = require("express");
const router = express.Router();
const styleController = require("../controllers/style.controllers");
const cors = require('cors');
// Routes pour la gestion des styles
router.get("/style", cors(),styleController.getAllStyles);
router.get("/style/:styleId",cors(), styleController.getStyleById);
router.post("/style", cors(),styleController.createStyle);
router.put("/style/:id_style",cors(), styleController.updateStyle);
router.delete("/style/:id_style",cors(), styleController.deleteStyle);

module.exports = router;
