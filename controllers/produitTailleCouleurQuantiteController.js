const db = require("../utils/db_config"); // Assurez-vous que vous avez bien configuré votre fichier db_config.js

// Créer une nouvelle association produit-taille-couleur avec quantité
exports.createProduitTailleCouleurQuantite = async (req, res) => {
  const { produitId, tailleId, couleurId, quantite } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO produit_taille_couleur_quantite (id_prod, id_taille, id_coul, quantite) VALUES (?, ?, ?, ?)",
      [produitId, tailleId, couleurId, quantite]
    );

    res.status(201).json({
      message: "Association produit-taille-couleur-quantité créée avec succès",
      produitTailleCouleurQuantite: {
        produitId,
        tailleId,
        couleurId,
        quantite,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'association produit-taille-couleur-quantité:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la création de l'association produit-taille-couleur-quantité",
    });
  }
};

// Récupérer toutes les associations produit-taille-couleur-quantité
exports.getAllProduitTailleCouleurQuantites = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT * FROM produit_taille_couleur_quantite"
    );

    // Reformater les résultats pour un format personnalisé
    const formattedResults = results.map((item) => ({
      produitId: item.id_prod,
      tailleId: item.id_taille,
      couleurId: item.id_coul,
      quantite: item.quantite,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des associations produit-taille-couleur-quantité:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération des associations produit-taille-couleur-quantité",
    });
  }
};

// Récupérer une association spécifique produit-taille-couleur-quantité par ID produit
exports.getProduitTailleCouleurQuantiteByProduitId = async (req, res) => {
  const { produitId } = req.params;

  try {
    const [results] = await db.query(
      `SELECT 
        ptcq.id_prod AS produitId, 
        ptcq.id_taille AS tailleId, 
        ptcq.id_coul AS couleurId, 
        ptcq.quantite AS quantite,
        t.nom_taille AS tailleName,
        c.description_couleur AS couleurDescription, 
        c.hexa_value AS couleurHexa
      FROM produit_taille_couleur_quantite ptcq
      JOIN taille t ON ptcq.id_taille = t.id_taille
      JOIN couleur c ON ptcq.id_coul = c.id_coul
      WHERE ptcq.id_prod = ?`,
      [produitId]
    );

    if (results.length === 0) {
      return res.status(404).json({
        error: "Aucune association trouvée pour ce produit",
      });
    }

    // Reformater les résultats pour inclure les informations des tailles, couleurs et quantités
    const formattedResults = results.map((item) => ({
      produitId: item.produitId,
      tailleId: item.tailleId,
      tailleName: item.tailleName,
      couleurId: item.couleurId,
      couleurDescription: item.couleurDescription,
      couleurHexa: item.couleurHexa,
      quantite: item.quantite,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'association produit-taille-couleur-quantité:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération de l'association produit-taille-couleur-quantité",
    });
  }
};

// Mettre à jour la quantité d'une association produit-taille-couleur
exports.updateProduitTailleCouleurQuantite = async (req, res) => {
  const { produitId, tailleId, couleurId, quantite } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE produit_taille_couleur_quantite 
       SET quantite = ? 
       WHERE id_prod = ? AND id_taille = ? AND id_coul = ?`,
      [quantite, produitId, tailleId, couleurId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Aucune association trouvée pour mettre à jour",
      });
    }

    res.status(200).json({
      message: "Quantité mise à jour avec succès",
      produitTailleCouleurQuantite: {
        produitId,
        tailleId,
        couleurId,
        quantite,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la quantité produit-taille-couleur-quantité:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la mise à jour de la quantité produit-taille-couleur-quantité",
    });
  }
};

// Supprimer une association produit-taille-couleur-quantité
exports.deleteProduitTailleCouleurQuantite = async (req, res) => {
  const { produitId, tailleId, couleurId } = req.body;

  try {
    const [result] = await db.query(
      `DELETE FROM produit_taille_couleur_quantite 
       WHERE id_prod = ? AND id_taille = ? AND id_coul = ?`,
      [produitId, tailleId, couleurId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Aucune association trouvée pour supprimer",
      });
    }

    res.status(200).json({
      message:
        "Association produit-taille-couleur-quantité supprimée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de l'association produit-taille-couleur-quantité:",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la suppression de l'association produit-taille-couleur-quantité",
    });
  }
};
