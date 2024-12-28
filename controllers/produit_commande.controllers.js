const db = require("../utils/db_config"); // Ajustez le chemin selon votre structure de projet

// Créer une association produit-commande
exports.createProduitCommande = async (req, res) => {
  const { commandeId, produitId, quantite } = req.body;

  try {
    // Vérifier si la quantité est nulle ou non fournie, puis définir une valeur par défaut de 1
    const qte = quantite ? quantite : 1;

    // Assurez-vous que la quantité est un entier positif
    if (qte <= 0) {
      return res
        .status(400)
        .json({ error: "La quantité doit être supérieure à 0." });
    }

    const [result] = await db.query(
      "INSERT INTO produit_commande (id_commande, id_prod, qte_prod) VALUES (?, ?, ?)",
      [commandeId, produitId, qte]
    );

    res.status(201).json({
      message: "Association produit-commande créée avec succès",
      produitCommandeId: result.insertId, // Id de la nouvelle association créée
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'association produit-commande:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la création de l'association produit-commande",
    });
  }
};

// Récupérer toutes les associations produit-commande
exports.getAllProduitCommandes = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM produit_commande");

    // Reformater les résultats pour les sortir dans un format différent
    const formattedResults = results.map((item) => ({
      commandeId: item.id_commande,
      produitId: item.id_prod,
      quantite: item.qte_prod,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des associations produit-commande:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des associations produit-commande",
    });
  }
};

// Récupérer une association produit-commande par id
exports.getProduitCommandeById = async (req, res) => {
  const { commandeId, produitId } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM produit_commande WHERE id_commande = ? AND id_prod = ?",
      [commandeId, produitId]
    );

    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "Association produit-commande non trouvée" });
    }

    const item = results[0];
    const formattedResult = {
      commandeId: item.id_commande,
      produitId: item.id_prod,
      quantite: item.qte_prod,
    };

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'association produit-commande:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération de l'association produit-commande",
    });
  }
};

// Mettre à jour une association produit-commande
exports.updateProduitCommande = async (req, res) => {
  const { commandeId, produitId } = req.params;
  const { quantite } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE produit_commande SET qte_prod = ? WHERE id_commande = ? AND id_prod = ?",
      [quantite, commandeId, produitId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Association produit-commande non trouvée" });
    }

    res.status(200).json({
      message: "Association produit-commande mise à jour avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'association produit-commande:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la mise à jour de l'association produit-commande",
    });
  }
};

// Supprimer une association produit-commande
exports.deleteProduitCommande = async (req, res) => {
  const { commandeId, produitId } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM produit_commande WHERE id_commande = ? AND id_prod = ?",
      [commandeId, produitId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Association produit-commande non trouvée" });
    }

    res
      .status(200)
      .json({ message: "Association produit-commande supprimée avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'association produit-commande:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la suppression de l'association produit-commande",
    });
  }
};
