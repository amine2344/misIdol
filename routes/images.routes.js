const upload = require("../middlewares/multer/multerConfig");



const express = require("express");
const router = express.Router();
const cors = require('cors');
const photoController = require("../controllers/photo.controllers");

//router.use(cors({ origin: "http://localhost:5173", credentials: true }));


// Get all images
router.get("/images", photoController.getImages);

// Upload a new image
router.post("/images", upload.array("photos", 10), photoController.uploadImage);

// Edit an existing image
router.put("/images/:id", photoController.editImage);

// Delete an image
router.delete("/images/:id", photoController.deleteImage);

module.exports = router;

