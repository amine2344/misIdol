// controllers/couleurController.js
const db = require("../utils/db_config");
const fs = require("fs");

// Fonction utilitaire pour formater une couleur
const formatCouleur = (couleur) => ({
  id: couleur.id_coul,
  description: couleur.description_couleur,
  hexa: couleur.hexa_value,
  photo: couleur.photo_path,
});

// Créer une nouvelle couleur
exports.createCouleur = async (req, res) => {
  const { description, hexa } = req.body; // Format d'entrée
  const photo_path = req.file ? req.file.path : null; // Chemin de la photo uploadée

  try {
    const [results] = await db.query(
      "INSERT INTO couleur (description_couleur, photo_path, hexa_value) VALUES (?, ?, ?)",
      [description, photo_path || null, hexa || null]
    );

    res.status(201).json({
      message: "Couleur créée",
      couleur: {
        id: results.insertId,
        description,
        hexa,
        photo: photo_path,
      },
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Mettre à jour une couleur
exports.updateCouleur = async (req, res) => {
  const { id } = req.params;
  const { description, hexa } = req.body; // Format d'entrée
  const newPhotoPath = req.file ? req.file.path : null;

  try {
    const [results] = await db.query(
      "SELECT * FROM couleur WHERE id_coul = ?",
      [id]
    );

    if (results.length === 0)
      return res.status(404).json({ message: "Couleur non trouvée" });

    const couleur = results[0];
    const oldPhotoPath = couleur.photo_path;

    await db.query(
      "UPDATE couleur SET description_couleur = ?, photo_path = ?, hexa_value = ? WHERE id_coul = ?",
      [description, newPhotoPath || oldPhotoPath, hexa, id]
    );

    if (newPhotoPath && oldPhotoPath) {
      fs.unlink(oldPhotoPath, (unlinkError) => {
        if (unlinkError)
          console.error(
            `Erreur lors de la suppression de l'ancienne photo: ${unlinkError}`
          );
      });
    }

    // Format de sortie
    res.status(200).json({
      message: "Couleur mise à jour",
      couleur: {
        id,
        description,
        hexa,
        photo: newPhotoPath || oldPhotoPath,
      },
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Supprimer une couleur
exports.deleteCouleur = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM couleur WHERE id_coul = ?",
      [id]
    );

    if (results.length === 0)
      return res.status(404).json({ message: "Couleur non trouvée" });

    const couleur = results[0];
    const photoPath = couleur.photo_path;

    await db.query("DELETE FROM couleur WHERE id_coul = ?", [id]);

    if (photoPath) {
      fs.unlink(photoPath, (unlinkError) => {
        if (unlinkError)
          console.error(
            `Erreur lors de la suppression de la photo: ${unlinkError}`
          );
      });
    }

    res.status(200).json({ message: "Couleur supprimée" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Obtenir toutes les couleurs
exports.getAllCouleurs = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM couleur");

    // Transforme le format des données
    const couleurs = results.map(formatCouleur);

    res.status(200).json(couleurs);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Obtenir une couleur par ID
exports.getCouleurById = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM couleur WHERE id_coul = ?",
      [id]
    );

    if (results.length === 0)
      return res.status(404).json({ message: "Couleur non trouvée" });

    // Format de sortie
    const couleur = formatCouleur(results[0]);
    res.status(200).json(couleur);
  } catch (error) {
    res.status(500).json({ error });
  }
};
