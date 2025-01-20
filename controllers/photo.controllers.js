const connection = require("../utils/db_config");
const fs = require("fs");
const path = require("path");
const fetch = require('node-fetch');
const multer = require('multer');

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' });

exports.uploadImage = async (req, res) => {
  try {
    // Destructure title and photoUrl from the request body
    const { title, photoUrl } = req.body;

    // Insert the image into the database
    const [result] = await connection.query(
      `INSERT INTO images (imgSrc, title) VALUES (?, ?)`,
      [photoUrl, title]
    );

    // Respond with the inserted image details
    res.status(201).json({
      message: 'Image uploaded successfully',
      id: result.insertId,   // ID of the newly inserted image
      imgSrc: photoUrl,      // URL of the uploaded image
      title,                 // Title of the uploaded image
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Failed to upload image." });
  }
};

// Ajouter plusieurs photos
exports.addPhotos = async (req, res) => {
  const {
    collectionId,
    styleId,
    isProductCover,
    isProductHoverCover,
    isStyleCover,
    isCollectionCover,
    photoUrls, // URLs received from the client
  } = req.body;

  if (!photoUrls || photoUrls.length === 0) {
    return res
      .status(400)
      .json({ message: "No photo URLs provided." });
  }

  try {
    let newPhotos = [];

    for (const url of photoUrls) {
      const [result] = await connection.query(
        `INSERT INTO photo (path_photo, name_photo, is_prod_cover, is_prod_cover_on_hover, id_col, id_style, is_style_cover, is_col_cover) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          url, // Use the Imghippo URL as the path
          url.split("/").pop(), // Extract filename from the URL
          isProductCover ? 1 : 0,
          isProductHoverCover ? 1 : 0,
          collectionId,
          styleId,
          isStyleCover ? 1 : 0,
          isCollectionCover ? 1 : 0,
        ]
      );

      newPhotos.push({
        id: result.insertId,
        path_photo: url,
        name_photo: url.split("/").pop(),
        isProductCover: Boolean(isProductCover),
        isProductHoverCover: Boolean(isProductHoverCover),
        collectionId: collectionId,
        styleId: styleId,
        isStyleCover: Boolean(isStyleCover),
        isCollectionCover: Boolean(isCollectionCover),
      });
    }

    res
      .status(201)
      .json({ message: "Photos added successfully", photos: newPhotos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding photos." });
  }
};

// Mise à jour d'une photo
exports.updatePhoto = async (req, res) => {
  const { id } = req.params;
  const {
    collectionId,
    styleId,
    isProductCover,
    isProductHoverCover,
    isStyleCover,
    isCollectionCover,
  } = req.body;
  const file = req.file; // La nouvelle photo téléchargée (si présente)

  try {
    // Récupérer l'ancienne photo de la base de données
    const [oldPhoto] = await connection.query(
      `SELECT path_photo FROM photo WHERE id_photo = ?`,
      [id]
    );

    if (!oldPhoto.length) {
      return res.status(404).json({ message: "Photo non trouvée." });
    }

    let photoPath = oldPhoto[0].path_photo;

    // Si une nouvelle photo est téléchargée, supprimer l'ancienne du serveur
    if (file) {
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath); // Supprime l'ancienne photo du serveur
      }
      photoPath = file.path; // Mettre à jour avec le nouveau chemin de la photo
    }

    // Mise à jour des informations dans la base de données
    await connection.query(
      `UPDATE photo SET path_photo = ?, name_photo = ?, is_prod_cover = ?, is_prod_cover_on_hover = ?, id_col = ?, id_style = ?, is_style_cover = ?, is_col_cover = ? WHERE id_photo = ?`,
      [
        photoPath,
        file ? file.filename : oldPhoto[0].name_photo,
        isProductCover ? 1 : 0,
        isProductHoverCover ? 1 : 0,
        collectionId,
        styleId,
        isStyleCover ? 1 : 0,
        isCollectionCover ? 1 : 0,
        id,
      ]
    );

    res.status(200).json({ message: "Photo mise à jour avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la photo." });
  }
};

// Suppression d'une photo
//
//
exports.getImages = async (req, res) => {
  try {
    // Fetch images from the database
    const [images] = await connection.query(
      `SELECT id, imgSrc, title FROM images`
    );

    if (!images.length) {
      return res.status(404).json({ message: "No images found." });
    }

    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Failed to fetch images." });
  }
};
exports.deleteImage = async (req, res) => {
  const { id } = req.params; // Image ID from URL parameters

  try {
    // Delete the image from the database
    const [result] = await connection.query(
      `DELETE FROM images WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Failed to delete image." });
  }
};
exports.editImage = async (req, res) => {
  const { id } = req.params; // Image ID from URL parameters
  const { title, imgSrc } = req.body; // New title and image URL from the request body

  try {
    // Update the image in the database
    const [result] = await connection.query(
      `UPDATE images SET imgSrc = ?, title = ? WHERE id = ?`,
      [imgSrc, title, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    res.status(200).json({ message: "Image updated successfully." });
  } catch (error) {
    console.error("Error editing image:", error);
    res.status(500).json({ message: "Failed to update image." });
  }
};

exports.deletePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    // Récupérer le chemin de la photo dans la base de données
    const [photo] = await connection.query(
      `SELECT path_photo FROM photo WHERE id_photo = ?`,
      [id]
    );

    if (!photo.length) {
      return res.status(404).json({ message: "Photo non trouvée." });
    }

    const photoPath = photo[0].path_photo;

    // Supprimer la photo du serveur
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Supprimer l'enregistrement de la photo de la base de données
    await connection.query(`DELETE FROM photo WHERE id_photo = ?`, [id]);

    res.status(200).json({ message: "Photo supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la photo." });
  }
};

// Récupérer toutes les photos d'un produit
exports.getPhotosByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const [photos] = await connection.query(
      `SELECT id_photo, path_photo, name_photo, is_prod_cover, is_prod_cover_on_hover, id_col, id_style, is_style_cover, is_col_cover 
       FROM photo 
       WHERE id_style = ? OR id_col = ?`,
      [productId, productId]
    );

    const formattedPhotos = photos.map((photo) => ({
      id: photo.id_photo,
      path: photo.path_photo,
      name: photo.name_photo,
      isProductCover: Boolean(photo.is_prod_cover),
      isProductHoverCover: Boolean(photo.is_prod_cover_on_hover),
      collectionId: photo.id_col,
      styleId: photo.id_style,
      isStyleCover: Boolean(photo.is_style_cover),
      isCollectionCover: Boolean(photo.is_col_cover),
    }));

    res.status(200).json({ photos: formattedPhotos });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des photos." });
  }
};

exports.getPhotosByCollectionId = async (req, res) => {
  const { collectionId } = req.params;

  if (!collectionId) {
    return res
      .status(400)
      .json({ message: "L'ID de la collection est requis." });
  }

  try {
    // Récupérer les photos associées à l'ID de la collection
    const [photos] = await connection.query(
      `SELECT id_photo, path_photo, name_photo, is_prod_cover, is_prod_cover_on_hover, is_style_cover, is_col_cover
       FROM photo 
       WHERE id_col = ?`,
      [collectionId]
    );

    if (photos.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune photo trouvée pour cette collection." });
    }

    // Transformer les données pour ne pas correspondre au format de la base de données
    const formattedPhotos = photos.map((photo) => ({
      id: photo.id_photo,
      path: photo.path_photo,
      filename: photo.name_photo,
      isProductCover: Boolean(photo.is_prod_cover), // Conversion en booléen
      isProductHoverCover: Boolean(photo.is_prod_cover_on_hover),
      isStyleCover: Boolean(photo.is_style_cover),
      isCollectionCover: Boolean(photo.is_col_cover),
    }));

    res.status(200).json({
      message: "Photos récupérées avec succès",
      photos: formattedPhotos, // Envoyer les données formatées
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des photos:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des photos." });
  }
};

exports.setCoverPhoto = async (req, res) => {
  const { productId, photoId } = req.params;

  try {
    // Réinitialiser les autres photos de couverture associées à ce produit
    await connection.query(
      `UPDATE photo 
           SET is_prod_cover = 0 
           WHERE is_prod_cover = 1 
           AND id_photo IN (
               SELECT id_photo FROM produit_couleur_photo WHERE id_prod = ?
           ) 
           AND id_photo <> ?`,
      [productId, photoId]
    );

    // Mettre à jour la photo sélectionnée comme couverture
    await connection.query(
      `UPDATE photo 
           SET is_prod_cover = 1 
           WHERE id_photo = ?`,
      [photoId]
    );

    return res
      .status(200)
      .json({ message: "Photo de couverture mise à jour avec succès." });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour de la photo de couverture:",
      err
    );
    return res.status(500).json({
      message: "Erreur lors de la mise à jour de la photo de couverture.",
    });
  }
};

exports.setHoverCoverPhoto = async (req, res) => {
  const { productId, photoId } = req.params;

  try {
    // Réinitialiser les autres photos de couverture au survol associées à ce produit
    await connection.query(
      `UPDATE photo 
           SET is_prod_cover_on_hover = 0 
           WHERE is_prod_cover_on_hover = 1 
           AND id_photo IN (
               SELECT id_photo FROM produit_couleur_photo WHERE id_prod = ?
           ) 
           AND id_photo <> ?`,
      [productId, photoId]
    );

    // Mettre à jour la photo sélectionnée comme couverture au survol
    await connection.query(
      `UPDATE photo 
           SET is_prod_cover_on_hover = 1 
           WHERE id_photo = ?`,
      [photoId]
    );

    return res.status(200).json({
      message: "Photo de couverture au survol mise à jour avec succès.",
    });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour de la photo de couverture au survol:",
      err
    );
    return res.status(500).json({
      message:
        "Erreur lors de la mise à jour de la photo de couverture au survol.",
    });
  }
};
