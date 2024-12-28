const db = require("../utils/db_config");

// Mapper pour formater les données de sous-catégorie
const mapSousCategorie = (row) => ({
  id: row.id_sous_cat,
  name: row.nom_sous_cat,
  categoryId: row.id_cat,
});

// Mapper pour formater les données renvoyées au frontend
const formatSousCategorieResponse = (data) => ({
  id: data.id,
  name: data.name,
  categoryId: data.categoryId,
});

// Récupérer toutes les sous-catégories
const getAllSousCategorie = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM sous_categorie");
    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucune sous-catégorie trouvée" });
    }

    // Utilisation du mapper pour formater les données
    const formattedData = rows
      .map(mapSousCategorie)
      .map(formatSousCategorieResponse);

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des sous-catégories:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des sous-catégories" });
  }
};

// Créer une nouvelle sous-catégorie
const createSousCategorie = async (req, res) => {
  const { name, categoryId } = req.body;

  // Vérifiez que les champs ne sont pas vides ou nuls
  if (!name || !categoryId) {
    return res
      .status(400)
      .json({ message: "Le nom et la catégorie sont requis." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO sous_categorie (nom_sous_cat, id_cat) VALUES (?, ?)",
      [name, categoryId]
    );

    // Utilisation du mapper pour formater les données
    const sousCategorie = mapSousCategorie({
      id_sous_cat: result.insertId,
      nom_sous_cat: name, // Changement ici
      id_cat: categoryId, // Changement ici
    });

    res.status(201).json({
      message: "Sous-catégorie créée avec succès",
      sousCategorie: formatSousCategorieResponse(sousCategorie),
    });
  } catch (error) {
    console.error("Erreur lors de la création de la sous-catégorie:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la sous-catégorie" });
  }
};

// Récupérer une sous-catégorie par ID
const getSousCategorieById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM sous_categorie WHERE id_sous_cat = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Sous-catégorie non trouvée" });
    }

    // Utilisation du mapper pour formater les données
    const sousCategorie = mapSousCategorie(rows[0]);

    res.status(200).json(formatSousCategorieResponse(sousCategorie));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la sous-catégorie:",
      error
    );
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la sous-catégorie" });
  }
};

// Mettre à jour une sous-catégorie (champs optionnels)
const updateSousCategorie = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId } = req.body; // Utilisation des bons noms de propriété

  try {
    const [currentData] = await db.query(
      "SELECT * FROM sous_categorie WHERE id_sous_cat = ?",
      [id]
    );

    if (currentData.length === 0) {
      return res.status(404).json({ message: "Sous-catégorie non trouvée" });
    }

    // Vérification des nouvelles valeurs et conservation des anciennes si nulles
    const updatedName = name !== undefined ? name : currentData[0].nom_sous_cat;
    const updatedCategoryId =
      categoryId !== undefined ? categoryId : currentData[0].id_cat;

    const [result] = await db.query(
      "UPDATE sous_categorie SET nom_sous_cat = ?, id_cat = ? WHERE id_sous_cat = ?",
      [updatedName, updatedCategoryId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sous-catégorie non trouvée" });
    }

    // Utilisation du mapper pour formater les données mises à jour
    const sousCategorie = mapSousCategorie({
      id_sous_cat: id,
      nom_sous_cat: updatedName,
      id_cat: updatedCategoryId,
    });

    res.status(200).json({
      message: "Sous-catégorie mise à jour",
      sousCategorie: formatSousCategorieResponse(sousCategorie),
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la sous-catégorie:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la sous-catégorie" });
  }
};

// Supprimer une sous-catégorie
const deleteSousCategorie = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM sous_categorie WHERE id_sous_cat = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sous-catégorie non trouvée" });
    }

    // Message de confirmation avec format personnalisé
    res.status(200).json({
      message: "Sous-catégorie supprimée avec succès",
      deletedSousCategorieId: id,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la sous-catégorie:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la sous-catégorie" });
  }
};

module.exports = {
  createSousCategorie,
  getSousCategorieById,
  updateSousCategorie,
  deleteSousCategorie,
  getAllSousCategorie,
};
