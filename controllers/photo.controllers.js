const connection = require("../utils/db_config");
const fs = require("fs");
const path = require("path");

// Ajouter plusieurs photos
exports.addPhotos = async (req, res) => {
  const {
    collectionId,
    styleId,
    isProductCover,
    isProductHoverCover,
    isStyleCover,
    isCollectionCover,
  } = req.body;
  const files = req.files; // On récupère toutes les photos téléchargées

  if (!files || files.length === 0) {
    return res
      .status(400)
      .json({ message: "Aucune photo n'a été téléchargée." });
  }

  try {
    let newPhotos = [];

    for (const file of files) {
      const [result] = await connection.query(
        `INSERT INTO photo (path_photo, name_photo, is_prod_cover, is_prod_cover_on_hover, id_col, id_style, is_style_cover, is_col_cover) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          file.path,
          file.filename,
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
        path: file.path,
        name: file.filename,
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
      .json({ message: "Photos ajoutées avec succès", photos: newPhotos });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Erreur lors de l'ajout des photos." });
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
