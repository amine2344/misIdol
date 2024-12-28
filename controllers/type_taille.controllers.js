const db = require("../utils/db_config");

// Obtenir tous les types de taille
const getAllTypeTailles = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM type_taille");
    // Transformation du format de réponse
    const response = rows.map((row) => ({
      id: row.id_type_taille,
      name: row.nom_type_taille,
    }));
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des types de taille",
      error,
    });
  }
};

// Obtenir un type de taille par ID
const getTypeTailleById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM type_taille WHERE id_type_taille = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Type de taille non trouvé" });
    }
    // Transformation du format de réponse
    const response = {
      id: rows[0].id_type_taille,
      name: rows[0].nom_type_taille,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du type de taille",
      error,
    });
  }
};

// Créer un nouveau type de taille
const createTypeTaille = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO type_taille (nom_type_taille) VALUES (?)",
      [name]
    );
    // Transformation du format de réponse
    const response = {
      message: "Type de taille créé",
      id: result.insertId,
      name,
    };
    res.status(201).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création du type de taille", error });
  }
};

// Mettre à jour un type de taille par ID (mise à jour partielle)
const updateTypeTaille = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push("nom_type_taille = ?");
    values.push(name);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  values.push(id);

  const sql = `UPDATE type_taille SET ${updates.join(
    ", "
  )} WHERE id_type_taille = ?`;

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Type de taille non trouvé" });
    }

    // Transformation du format de réponse
    const response = {
      message: "Type de taille mis à jour",
      id,
      name: name !== undefined ? name : undefined,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du type de taille",
      error,
    });
  }
};

// Supprimer un type de taille par ID
const deleteTypeTaille = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM type_taille WHERE id_type_taille = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Type de taille non trouvé" });
    }
    res.status(200).json({ message: "Type de taille supprimé" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du type de taille",
      error,
    });
  }
};

module.exports = {
  getAllTypeTailles,
  getTypeTailleById,
  createTypeTaille,
  updateTypeTaille,
  deleteTypeTaille,
};
