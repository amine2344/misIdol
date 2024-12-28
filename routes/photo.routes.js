const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer/multerConfig"); // Middleware Multer
const photoController = require("../controllers/photo.controllers");

// Récupérer les photos d'un produit par ID de produit
router.get("/photos/:productId", photoController.getPhotosByProductId);

router.get(
  "/collection/:collectionId/photos",
  photoController.getPhotosByCollectionId
);

// Ajouter une photo
router.post("/photos", upload.array("photos", 10), photoController.addPhotos);

// Supprimer une photo
router.delete("/photos/:id", photoController.deletePhoto);

// Route pour mettre à jour une photo avec la possibilité de changer l'image
router.put("/photos/:id", upload.single("photo"), photoController.updatePhoto);

// Route pour mettre à jour la photo de couverture d'un produit
router.put(
  "/produit/:productId/photo/:photoId/cover",
  photoController.setCoverPhoto
);

// Route pour mettre à jour la photo de couverture au survol d'un produit
router.put(
  "/produit/:productId/photo/:photoId/hover-cover",
  photoController.setHoverCoverPhoto
);

module.exports = router;
