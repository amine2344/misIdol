const connection = require("../utils/db_config");

// Créer une nouvelle catégorie
const createCategorie = async (req, res) => {
  const { name, description, sectionId } = req.body;

  // Validation d'entrée
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res
      .status(400)
      .json({
        error:
          "Le champ 'name' est requis et doit être une chaîne de caractères valide.",
      });
  }
  if (
    !description ||
    typeof description !== "string" ||
    description.trim() === ""
  ) {
    return res
      .status(400)
      .json({
        error:
          "Le champ 'description' est requis et doit être une chaîne de caractères valide.",
      });
  }
  if (!sectionId || isNaN(sectionId)) {
    return res
      .status(400)
      .json({
        error: "Le champ 'sectionId' est requis et doit être un nombre valide.",
      });
  }

  try {
    const [result] = await connection.query(
      "INSERT INTO categorie (nom_cat, description_cat, id_sec) VALUES (?, ?, ?)",
      [name.trim(), description.trim(), sectionId]
    );

    const newCategorie = {
      id: result.insertId,
      name: name.trim(),
      description: description.trim(),
      sectionId,
    };

    res.status(201).json(newCategorie);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Une erreur est survenue lors de la création de la catégorie.",
      });
    console.error("Erreur SQL:", error.message); // Log pour le débogage
  }
};

// Récupérer toutes les catégories avec le nom de la section
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await connection.query(`
      SELECT c.id_cat, c.nom_cat, c.description_cat, 
             c.id_sec, s.nom_sec AS sectionName
      FROM categorie c
      LEFT JOIN section s ON c.id_sec = s.id_sec
    `);

    const formattedCategories = categories.map((category) => ({
      id: category.id_cat,
      name: category.nom_cat,
      description: category.description_cat,
      sectionId: category.id_sec,
      sectionName: category.sectionName || null, // Gérer les catégories sans section
    }));

    res.status(200).json(formattedCategories);
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "Une erreur est survenue lors de la récupération des catégories.",
      });
    console.error("Erreur SQL:", error.message);
  }
};

// Récupérer une catégorie par ID avec le nom de la section
const getCategorieById = async (req, res) => {
  const { id_cat } = req.params;

  if (!id_cat || isNaN(id_cat)) {
    return res
      .status(400)
      .json({ error: "L'ID de la catégorie doit être un nombre valide." });
  }

  try {
    const [categories] = await connection.query(
      `
      SELECT c.id_cat, c.nom_cat, c.description_cat, 
             c.id_sec, s.nom_sec AS sectionName
      FROM categorie c
      LEFT JOIN section s ON c.id_sec = s.id_sec
      WHERE c.id_cat = ?
    `,
      [id_cat]
    );

    if (categories.length === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    const category = categories[0];
    const formattedCategory = {
      id: category.id_cat,
      name: category.nom_cat,
      description: category.description_cat,
      sectionId: category.id_sec,
      sectionName: category.sectionName || null,
    };

    res.status(200).json(formattedCategory);
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "Une erreur est survenue lors de la récupération de la catégorie.",
      });
    console.error("Erreur SQL:", error.message);
  }
};

// Mettre à jour une catégorie
const updateCategorie = async (req, res) => {
  const { id_cat } = req.params;
  const { name, description, sectionId } = req.body;

  if (!id_cat || isNaN(id_cat)) {
    return res
      .status(400)
      .json({ error: "L'ID de la catégorie doit être un nombre valide." });
  }

  const updates = [];
  const params = [];

  // Ajout des mises à jour uniquement pour les champs fournis
  if (name !== undefined && name.trim() !== "") {
    updates.push(`nom_cat = ?`);
    params.push(name.trim());
  }
  if (description !== undefined && description.trim() !== "") {
    updates.push(`description_cat = ?`);
    params.push(description.trim());
  }
  if (sectionId !== undefined && !isNaN(sectionId)) {
    updates.push(`id_sec = ?`);
    params.push(sectionId);
  }

  // Vérification si au moins un champ est fourni
  if (updates.length === 0) {
    return res.status(400).json({
      message: "Au moins un champ valide doit être fourni pour la mise à jour.",
    });
  }

  try {
    params.push(id_cat);
    const query = `UPDATE categorie SET ${updates.join(", ")} WHERE id_cat = ?`;

    const [result] = await connection.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res.status(200).json({
      message: "Catégorie mise à jour avec succès",
      id: id_cat,
      updatedFields: { name, description, sectionId },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "Une erreur est survenue lors de la mise à jour de la catégorie.",
      });
    console.error("Erreur SQL:", error.message);
  }
};

// Supprimer une catégorie
const deleteCategorie = async (req, res) => {
  const { id_cat } = req.params;

  if (!id_cat || isNaN(id_cat)) {
    return res
      .status(400)
      .json({ error: "L'ID de la catégorie doit être un nombre valide." });
  }

  try {
    const [result] = await connection.query(
      "DELETE FROM categorie WHERE id_cat = ?",
      [id_cat]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }

    res
      .status(200)
      .json({ message: "Catégorie supprimée avec succès", id: id_cat });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "Une erreur est survenue lors de la suppression de la catégorie.",
      });
    console.error("Erreur SQL:", error.message);
  }
};

module.exports = {
  createCategorie,
  getAllCategories,
  getCategorieById,
  updateCategorie,
  deleteCategorie,
};
