const db = require("../utils/db_config"); // Assurez-vous que vous avez bien configuré votre fichier db.js pour les connexions MySQL

// Créer une association produit-couleur-photo
exports.createProduitCouleurPhoto = async (req, res) => {
  const { produitId, couleurId, photoId } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO produit_couleur_photo (id_prod, id_coul, id_photo) VALUES (?, ?, ?)",
      [produitId, couleurId, photoId]
    );

    res.status(201).json({
      message: "Association produit-couleur-photo créée avec succès",
      produitCouleurPhoto: {
        produitId,
        couleurId,
        photoId,
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

    res.status(200).json(formattedResults);
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
    // Requête SQL pour récupérer les associations avec les infos des photos et des couleurs
    const [results] = await db.query(
      `SELECT 
        pcp.id_prod AS produitId, 
        pcp.id_coul AS couleurId, 
        pcp.id_photo AS photoId, 
        c.description_couleur AS couleurDescription, 
        c.hexa_value AS couleurHexa, 
        c.photo_path AS photoCouleurPath, 
        ph.name_photo AS photoName, 
        ph.path_photo AS photoPath, 
        ph.is_prod_cover AS cover, 
        ph.is_prod_cover_on_hover AS coverHover
      FROM produit_couleur_photo pcp
      JOIN couleur c ON pcp.id_coul = c.id_coul
      JOIN photo ph ON pcp.id_photo = ph.id_photo
      WHERE pcp.id_prod = ?`,
      [produitId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        error: "Aucune association trouvée pour ce produit",
      });
    }

    // Reformater les résultats pour inclure les informations des photos et des couleurs
    const formattedResults = results.map((item) => ({
      produitId: item.produitId,
      couleurId: item.couleurId,
      couleurDescription: item.couleurDescription,
      couleurHexa: item.couleurHexa,
      photoCouleurPath: item.photoCouleurPath,
      photoId: item.photoId,
      photoName: item.photoName,
      photoPath: item.photoPath,
      isCover: item.cover,
      coverHover: item.coverHover,
    }));

    res.status(200).json(formattedResults);
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
