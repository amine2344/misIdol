const db = require("../utils/db_config"); // Ajustez selon l'emplacement de votre fichier de connexion à la base de données

// Créer une association produit-taille
exports.createProduitTaille = async (req, res) => {
  const { tailleIds, produitId } = req.body; // Notez que nous attendons un tableau de tailleIds

  // Validation simple
  if (
    !tailleIds ||
    !Array.isArray(tailleIds) ||
    tailleIds.length === 0 ||
    !produitId
  ) {
    return res.status(400).json({
      error: "Les champs 'tailleIds' (tableau) et 'produitId' sont requis.",
    });
  }

  try {
    // Préparer une requête d'insertion pour toutes les tailles
    const values = tailleIds.map((tailleId) => [tailleId, produitId]);
    const [result] = await db.query(
      "INSERT INTO produit_taille (id_taille, id_prod) VALUES ?",
      [values]
    );

    res.status(201).json({
      message: "Associations produit-taille créées avec succès",
      produitTailleIds: result.insertId, // Renvoie l'ID de la première association créée
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Erreur lors de la création de l'association produit-taille",
      error,
    });
  }
};

// Récupérer toutes les associations produit-taille
exports.getAllProduitTailles = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM produit_taille");

    // Vérifier si des résultats ont été trouvés
    if (results.length === 0) {
      return res.status(404).json({
        error: "Aucune association trouvée pour ce produit",
      });
    }

    // Reformater les résultats
    const formattedResults = results.map((item) => ({
      tailleId: item.id_taille,
      produitId: item.id_prod,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des associations produit-taille:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des associations produit-taille",
      details: error.message,
    });
  }
};

// Récupérer une association produit-taille par ID
exports.getProduitTailleById = async (req, res) => {
  const { tailleId, produitId } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM produit_taille WHERE id_taille = ? AND id_prod = ?",
      [tailleId, produitId]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "Association produit-taille non trouvée" });
    }

    const formattedResult = {
      tailleId: results[0].id_taille,
      produitId: results[0].id_prod,
    };

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'association produit-taille",
    });
  }
};

// Mettre à jour une association produit-taille
exports.updateProduitTaille = async (req, res) => {
  const { tailleId, produitId } = req.params;
  const { newTailleId, newProduitId } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE produit_taille SET id_taille = ?, id_prod = ? WHERE id_taille = ? AND id_prod = ?",
      [newTailleId || tailleId, newProduitId || produitId, tailleId, produitId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Association produit-taille non trouvée" });
    }

    res.status(200).json({
      message: "Association produit-taille mise à jour avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour de l'association produit-taille",
    });
  }
};

// Supprimer une association produit-taille
exports.deleteProduitTaille = async (req, res) => {
  const { tailleId, produitId } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM produit_taille WHERE id_taille = ? AND id_prod = ?",
      [tailleId, produitId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Association produit-taille non trouvée" });
    }

    res.status(200).json({
      message: "Association produit-taille supprimée avec succès",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la suppression de l'association produit-taille",
    });
  }
};

// Récupérer toutes les tailles d'un produit
exports.getSizesByProductId = async (req, res) => {
  const productId = req.params.productId;

  // Validation de l'ID du produit
  if (!productId) {
    return res.status(400).json({ error: "L'ID du produit est requis." });
  }

  try {
    // Exécuter la requête pour obtenir les tailles associées au produit
    const [sizes] = await db.query(
      "SELECT t.id_taille AS tailleId, t.valeur_taille AS taille FROM produit_taille pt JOIN taille t ON pt.id_taille = t.id_taille WHERE pt.id_prod = ?",
      [productId]
    );

    // Vérification si des tailles ont été trouvées
    if (sizes.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucune taille trouvée pour ce produit." });
    }

    // Reformater les résultats pour une meilleure lisibilité
    const formattedSizes = sizes.map((size) => ({
      id: size.tailleId,
      name: size.taille,
    }));

    // Répondre avec les tailles formatées
    res.status(200).json(formattedSizes);
  } catch (error) {
    console.error("Erreur lors de la récupération des tailles :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des tailles.",
      error: error.message,
    });
  }
};
