const db = require("../utils/db_config"); // Assurez-vous quvous avez bien configuré votre fichier db.js pour les connexions MySQL

// Créer une association produit-couleur-photo
exports.createProduitCouleurPhoto = async (req, res) => {
  const { produitId, couleurId,photoId, photoUrl } = req.body; // Expecting photoUrl in the body

  try {
    // Insert the record with the correct values
    const [result] = await db.query(
      "INSERT INTO produit_couleur_photo (id_prod, id_coul,id_photo, photo_url) VALUES (?, ?, ?, ?)",
      [produitId, couleurId,photoId,  photoUrl] // Using photoUrl instead of photoId
    );

    res.status(201).json({
      message: "Association produit-couleur-photo créée avec succès",
      produitCouleurPhoto: {
        produitId,
        couleurId,
        photoUrl, // Returning photoUrl in the response
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'association produit-couleur-photo:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la création de l'association produit-couleur-photo",
    });
  }
};

// Récupérer toutes les associations produit-couleur-photo
exports.getAllProduitCouleurPhotos = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM produit_couleur_photo");

    // Reformater les résultats pour un format personnalisé
    const formattedResults = results.map((item) => ({
      produitId: item.id_prod,
      couleurId: item.id_coul,
      photoId: item.id_photo,
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des associations produit-couleur-photo:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération des associations produit-couleur-photo",
    });
  }
};

// Récupérer une association spécifique produit-couleur-photo par ID produit
exports.getProduitCouleurPhotoByProduitId = async (req, res) => {
  const { produitId } = req.params;

  try {
    // SQL query to retrieve the associations with photo and color information
    const [results] = await db.query(
      `SELECT 
              * from produit_couleur_photo

      WHERE id_prod = ?`,
      [produitId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        error: "Aucune association trouvée pour ce produit",
      });
    }

    // Format the results and replace photoPath with photoUrl

    res.status(200).json(results);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'association produit-couleur-photo:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération de l'association produit-couleur-photo",
    });
  }
};
// Supprimer une association produit-couleur-photo
exports.deleteProduitCouleurPhoto = async (req, res) => {
  const { produitId, couleurId, photoId } = req.body;

  try {
    await db.query(
      "DELETE FROM produit_couleur_photo WHERE id_prod = ? AND id_coul = ? AND id_photo = ?",
      [produitId, couleurId, photoId]
    );

    res.status(200).json({
      message: "Association produit-couleur-photo supprimée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'association produit-couleur-photo:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la suppression de l'association produit-couleur-photo",
    });
  }
};

