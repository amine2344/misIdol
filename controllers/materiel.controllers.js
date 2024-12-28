const db = require("../utils/db_config");

// Récupérer tous les matériels
const getAllMateriels = async (req, res) => {
  try {
    const [materiels] = await db.query("SELECT * FROM materiel");
    const formattedMateriels = materiels.map((mat) => ({
      id: mat.id_mat,
      name: mat.nom_mat,
      description: mat.description_mat,
    }));
    res.status(200).json(formattedMateriels);
  } catch (error) {
    console.error("Erreur lors de la récupération des matériels:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des matériels" });
  }
};

// Récupérer un matériel par ID
const getMaterielById = async (req, res) => {
  const materielId = req.params.id;

  try {
    const [materiel] = await db.query(
      "SELECT * FROM materiel WHERE id_mat = ?",
      [materielId]
    );

    if (materiel.length === 0) {
      return res.status(404).json({ message: "Matériel non trouvé" });
    }

    const formattedMateriel = {
      id: materiel[0].id_mat,
      name: materiel[0].nom_mat,
      description: materiel[0].description_mat,
    };

    res.json(formattedMateriel);
  } catch (error) {
    console.error("Erreur lors de la récupération du matériel:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du matériel" });
  }
};

// Créer un nouveau matériel
const createMateriel = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Le nom du matériel est requis." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO materiel (nom_mat, description_mat) VALUES (?, ?)",
      [name, description]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      message: "Matériel créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du matériel:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un matériel
const updateMateriel = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // Créer un tableau pour stocker les champs à mettre à jour et leurs valeurs
  const updates = [];
  const values = [];

  // Vérifier si le champ name est présent dans la requête
  if (name !== undefined) {
    updates.push("nom_mat = ?");
    values.push(name);
  }

  // Vérifier si le champ description est présent dans la requête
  if (description !== undefined) {
    updates.push("description_mat = ?");
    values.push(description);
  }

  // Si aucun champ à mettre à jour, retourner une erreur
  if (updates.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  // Ajouter l'id à la liste des valeurs pour la condition WHERE
  values.push(id);

  // Créer la requête SQL
  const sql = `UPDATE materiel SET ${updates.join(", ")} WHERE id_mat = ?`;

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Matériel non trouvé" });
    }

    res.status(200).json({
      message: "Matériel mis à jour",
      id,
      name: name !== undefined ? name : undefined,
      description: description !== undefined ? description : undefined,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du matériel:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du matériel" });
  }
};

// Supprimer un matériel
const deleteMateriel = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM materiel WHERE id_mat = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Matériel non trouvé" });
    }

    res.json({ message: "Matériel supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du matériel:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du matériel" });
  }
};

module.exports = {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
};
