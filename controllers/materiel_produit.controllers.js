const db = require("../utils/db_config"); // Importez votre configuration de base de données

// Créer une association matériel-produit avec un tableau d'objets
exports.createMaterielProduit = async (req, res) => {
  const { materiaux, produitId } = req.body;

  // Validation simple
  if (
    !materiaux ||
    !Array.isArray(materiaux) ||
    materiaux.length === 0 ||
    !produitId
  ) {
    return res.status(400).json({
      error:
        "Les champs 'materiaux' (tableau d'objets) et 'produitId' sont requis.",
    });
  }

  try {
    // Préparer les valeurs pour l'insertion
    const values = materiaux.map(({ id, pourcentage }) => [
      id,
      produitId,
      pourcentage,
    ]);
    const [result] = await db.query(
      "INSERT IGNORE INTO materiel_produit (id_mat, id_prod, pourcentage_mat) VALUES ?",
      [values]
    );

    res.status(201).json({
      message: "Associations matériel-produit créées avec succès",
      produitMaterielIds: result.insertId, // Renvoie l'ID de la première association créée
    });
  } catch (error) {
    console.log(
      "Erreur lors de la création de l'association matériel-produit:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la création de l'association matériel-produit",
    });
  }
};

// Récupérer toutes les associations matériel-produit
exports.getAllMaterielProduits = async (req, res) => {
  try {
    // Récupérer les résultats de la base de données
    const [results] = await db.query("SELECT * FROM materiel_produit");

    // Reformater les résultats pour les sortir dans un format différent
    const formattedResults = results.map((item) => ({
      materielId: item.id_mat,
      produitId: item.id_prod,
      pourcentage: item.pourcentage_mat,
    }));

    // Envoyer la réponse au client
    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des associations matériel-produit:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des associations matériel-produit",
    });
  }
};

// Récupérer une association spécifique
exports.getMaterielProduitById = async (req, res) => {
  const { materielId, produitId } = req.params;

  try {
    const results = await db.query(
      "SELECT * FROM materiel_produit WHERE id_mat = ? AND id_prod = ?",
      [materielId, produitId]
    );
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Association matériel-produit non trouvée" });
    }
    const item = results[0];
    res.status(200).json({
      materielId: item.id_mat,
      produitId: item.id_prod,
      pourcentage: item.pourcentage_mat,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'association matériel-produit",
    });
  }
};

// Mettre à jour une association matériel-produit
exports.updateMaterielProduit = async (req, res) => {
  const { materielId, produitId } = req.params;
  const { pourcentage } = req.body;

  try {
    const result = await db.query(
      "UPDATE materiel_produit SET pourcentage_mat = ? WHERE id_mat = ? AND id_prod = ?",
      [pourcentage, materielId, produitId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Association matériel-produit non trouvée" });
    }
    res.status(200).json({
      message: "Association matériel-produit mise à jour avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour de l'association matériel-produit",
    });
  }
};

// Supprimer une association matériel-produit
exports.deleteMaterielProduit = async (req, res) => {
  const { materielId, produitId } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM materiel_produit WHERE id_mat = ? AND id_prod = ?",
      [materielId, produitId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Association matériel-produit non trouvée" });
    }
    res
      .status(200)
      .json({ message: "Association matériel-produit supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la suppression de l'association matériel-produit",
    });
  }
};

exports.getMateriauxByProduitId = async (req, res) => {
  const { produitId } = req.params;

  try {
    // Requête SQL pour récupérer les matériaux associés à un produit spécifique
    const results = await db.query(
      `
      SELECT m.id_mat, m.nom_mat, mp.pourcentage_mat
      FROM materiel_produit mp
      JOIN materiel m ON mp.id_mat = m.id_mat
      WHERE mp.id_prod = ?
      `,
      [produitId]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun matériau associé à ce produit trouvé" });
    }

    // Formatage des résultats
    const materials = results[0].map((item) => ({
      materielId: item.id_mat,
      name: item.nom_mat,
      percentage: item.pourcentage_mat,
    }));

    return res.status(200).json(materials);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur lors de la récupération des matériaux associés au produit",
    });
  }
};
