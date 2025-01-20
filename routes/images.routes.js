const upload = require("../middlewares/multer/multerConfig");



const express = require("express");
const router = express.Router();
const cors = require('cors');
const photoController = require("../controllers/photo.controllers");

// Get all images
router.get("/images", cors(), photoController.getImages);

// Upload a new image
router.post("/images", cors(), upload.array("photos", 10), photoController.uploadImage);

// Edit an existing image
router.put("/images/:id", cors(), photoController.editImage);

// Delete an image
router.delete("/images/:id", cors(), photoController.deleteImage);

module.exports = router;

