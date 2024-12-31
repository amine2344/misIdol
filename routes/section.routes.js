// routes/sectionRoutes.js
const cors = require('cors');
const express = require("express");
const sectionController = require("../controllers/section.controllers");

const router = express.Router();

router.get("/section",cors(), sectionController.getAllSections);
router.get("/section/:id_sec",cors(), sectionController.getSectionById);
router.post("/section", cors(),sectionController.createSection);
router.put("/section/:id_sec", cors(),sectionController.updateSection);
router.delete("/section/:id_sec",cors(), sectionController.deleteSection);

module.exports = router;
