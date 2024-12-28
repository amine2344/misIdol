const db = require("../utils/db_config");

// Obtenir toutes les tailles
const getAllTailles = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT taille.id_taille as id, taille.valeur_taille as valeur, type_taille.nom_type_taille as 'type' 
      FROM taille 
      LEFT JOIN type_taille ON taille.id_type_taille = type_taille.id_type_taille`
    );
    // Transformation des données
    const formattedRows = rows.map((row) => ({
      id: row.id,
      valeur: row.valeur,
      type: row.type, // Changement de la clé pour correspondre au format souhaité
    }));
    res.status(200).json(formattedRows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des tailles", error });
  }
};

// Obtenir une taille par ID
const getTailleById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT taille.id_taille as id, taille.valeur_taille as valeur, type_taille.nom_type_taille as 'type' 
      FROM taille 
      LEFT JOIN type_taille ON taille.id_type_taille = type_taille.id_type_taille 
      WHERE taille.id_taille = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Taille non trouvée" });
    }
    // Transformation des données
    const formattedRow = {
      id: rows[0].id,
      valeur: rows[0].valeur,
      type: rows[0].type, // Changement de la clé
    };
    res.status(200).json(formattedRow);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la taille", error });
  }
};

// Créer une nouvelle taille
const createTaille = async (req, res) => {
  const { valeur, typeTailleId } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO taille (valeur_taille, id_type_taille) VALUES (?, ?)",
      [valeur, typeTailleId]
    );
    // Transformation de la réponse
    res.status(201).json({
      message: "Taille créée",
      id: result.insertId,
      valeur,
      typeTailleId, // Conservez ce champ si nécessaire
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la taille", error });
  }
};

// Mettre à jour une taille par ID (mise à jour partielle)
const updateTaille = async (req, res) => {
  const { id } = req.params;
  const { valeur, typeTailleId } = req.body;

  const updates = [];
  const values = [];

  if (valeur !== undefined) {
    updates.push("valeur_taille = ?");
    values.push(valeur);
  }

  if (typeTailleId !== undefined) {
    updates.push("id_type_taille = ?");
    values.push(typeTailleId);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  values.push(id);

  const sql = `UPDATE taille SET ${updates.join(", ")} WHERE id_taille = ?`;

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Taille non trouvée" });
    }

    // Transformation de la réponse
    res.status(200).json({
      message: "Taille mise à jour",
      id,
      valeur: valeur !== undefined ? valeur : undefined,
      typeTailleId: typeTailleId !== undefined ? typeTailleId : undefined,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la taille", error });
  }
};

// Supprimer une taille par ID
const deleteTaille = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM taille WHERE id_taille = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Taille non trouvée" });
    }
    res.status(200).json({ message: "Taille supprimée" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la taille", error });
  }
};

module.exports = {
  getAllTailles,
  getTailleById,
  createTaille,
  updateTaille,
  deleteTaille,
};
