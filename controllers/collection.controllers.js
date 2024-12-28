const db = require("../utils/db_config"); // Assurez-vous que le chemin est correct

// Récupérer toutes les collections
const getAllCollections = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM collection");
    const collections = rows.map((row) => ({
      id: row.id_col,
      name: row.nom_col,
      launchDate: row.date_lancement_col
        .toISOString()
        .slice(0, 19)
        .replace("T", " "), // Formatage de la date
    }));
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une collection par ID
const getCollectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        c.id_col AS id,
        c.nom_col AS name,
        c.date_lancement_col AS launchDate,
        p.id_photo AS photoId, 
        p.path_photo AS photoPath,
        p.is_style_cover AS isCover
      FROM 
        collection c 
      LEFT JOIN 
        photo p ON c.id_col = p.id_col
      WHERE 
        c.id_col = ?
    `;

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Collection non trouvée" });
    }

    // Formatage de la collection
    const collection = {
      id: rows[0].id,
      name: rows[0].name,
      launchDate: rows[0].launchDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      photos: rows
        .map((row) => ({
          id: row.photoId,
          path: row.photoPath,
          isCover: row.isCover === 1, // Vérifie si c'est une photo de couverture
        }))
        .filter((photo) => photo.id !== null), // Filtrer les photos nulles
    };

    res.status(200).json(collection);
  } catch (error) {
    console.error("Erreur lors de la récupération de la collection :", error);
    res.status(500).json({ error: error.message });
  }
};

// Créer une nouvelle collection
const createCollection = async (req, res) => {
  const { name, launchDate } = req.body;

  if (!name || !launchDate) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO collection (nom_col, date_lancement_col) VALUES (?, ?)",
      [name, launchDate]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      launchDate,
      message: "Collection créée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de la collection:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la collection" });
  }
};

// Mettre à jour une collection
const updateCollection = async (req, res) => {
  const { id } = req.params;
  const { name, launchDate } = req.body;

  // Vérification des champs à mettre à jour
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push(`nom_col = ?`);
    params.push(name);
  }
  if (launchDate !== undefined) {
    updates.push(`date_lancement_col = ?`);
    params.push(launchDate);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      message: "Au moins un champ doit être fourni pour la mise à jour.",
    });
  }

  params.push(id); // Ajouter l'ID à la fin des paramètres

  try {
    const query = `UPDATE collection SET ${updates.join(
      ", "
    )} WHERE id_col = ?`;
    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Collection non trouvée" });
    }

    res.status(200).json({ message: "Collection mise à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la collection:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la collection" });
  }
};

// Supprimer une collection
const fs = require("fs").promises; // Utiliser les promesses pour les opérations de fichiers
const path = require("path");

const deleteCollection = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection(); // Obtenir une connexion à la base de données
  try {
    await connection.beginTransaction(); // Démarrer une transaction

    // 1. Récupérer les photos associées à la collection
    const [photos] = await connection.query(
      `SELECT id_photo, path_photo FROM photo WHERE id_col = ?`,
      [id]
    );

    // 2. Supprimer les photos de la base de données et du système de fichiers
    for (const photo of photos) {
      // Supprimer la photo de la base de données
      await connection.query("DELETE FROM photo WHERE id_photo = ?", [
        photo.id_photo,
      ]);

      // Supprimer le fichier photo du système de fichiers
      const filePath = path.join(__dirname, "..", photo.path_photo);
      await fs.unlink(filePath).catch((err) => {
        console.error(
          `Erreur lors de la suppression de la photo : ${photo.path_photo}`,
          err
        );
      });
    }

    // 3. Supprimer la collection de la base de données
    const [result] = await connection.query(
      "DELETE FROM collection WHERE id_col = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Collection non trouvée" });
    }

    await connection.commit(); // Valider la transaction
    res
      .status(200)
      .json({ message: "Collection et photos supprimées avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la collection :", error);
    await connection.rollback(); // Annuler la transaction en cas d'erreur
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la collection" });
  } finally {
    connection.release(); // Libérer la connexion
  }
};

module.exports = {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
};
