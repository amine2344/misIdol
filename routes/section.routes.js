// routes/sectionRoutes.js

const express = require("express");
const sectionController = require("../controllers/section.controllers");

const router = express.Router();

router.get("/section", sectionController.getAllSections);
router.get("/section/:id_sec", sectionController.getSectionById);
router.post("/section", sectionController.createSection);
router.put("/section/:id_sec", sectionController.updateSection);
router.delete("/section/:id_sec", sectionController.deleteSection);

module.exports = router;
