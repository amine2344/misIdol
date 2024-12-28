const db = require("../utils/db_config");
const fs = require("fs").promises;
const path = require("path");

// Obtenir tous les produits
const getAllProduits = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id_prod, p.nom_prod, p.pu_prod, p.date_ajout_prod, p.description_prod,
             s.nom_sous_cat, st.nom_style,
             (SELECT ph.path_photo 
              FROM produit_couleur_photo pcp
              LEFT JOIN photo ph ON pcp.id_photo = ph.id_photo 
              WHERE pcp.id_prod = p.id_prod AND ph.is_prod_cover = 1 
              LIMIT 1) AS coverPhoto
      FROM produit p
      LEFT JOIN sous_categorie s ON p.id_sous_cat = s.id_sous_cat
      LEFT JOIN style st ON p.id_style = st.id_style
    `);

    // Reformater les données
    const produits = rows.map((prod) => ({
      id: prod.id_prod,
      productName: prod.nom_prod,
      unitPrice: parseFloat(prod.pu_prod).toFixed(2), // Formatage du prix
      addedDate: new Date(prod.date_ajout_prod).toISOString(), // Formatage de la date
      details: {
        description: prod.description_prod,
        subCategory: prod.nom_sous_cat,
        style: prod.nom_style,
      },
      coverPhoto: prod.coverPhoto || null, // Chemin de la photo de couverture ou null si aucune photo n'est disponible
    }));

    res.status(200).json(produits);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des produits", error });
  }
};

// Obtenir un produit par ID
const getProduitById = async (req, res) => {
  const { id } = req.params;
  try {
    // Récupération des informations de base du produit
    const [rows] = await db.query(
      `
      SELECT p.id_prod, p.nom_prod, p.pu_prod, p.date_ajout_prod, p.description_prod,
             s.id_sous_cat, s.nom_sous_cat, st.id_style, st.nom_style
      FROM produit p
      LEFT JOIN sous_categorie s ON p.id_sous_cat = s.id_sous_cat
      LEFT JOIN style st ON p.id_style = st.id_style
      WHERE p.id_prod = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Récupération des matériaux associés au produit
    const [materialsRows] = await db.query(
      `
      SELECT m.id_mat, m.nom_mat, pm.pourcentage_mat
      FROM materiel_produit pm
      LEFT JOIN materiel m ON pm.id_mat = m.id_mat
      WHERE pm.id_prod = ?
    `,
      [id]
    );

    // Récupération des tailles associées au produit
    const [sizesRows] = await db.query(
      `
      SELECT t.id_taille, t.valeur_taille
      FROM produit_taille pt
      LEFT JOIN taille t ON pt.id_taille = t.id_taille
      WHERE pt.id_prod = ?
    `,
      [id]
    );

    // Récupération des couleurs et photos associées au produit
    const [colorsPhotosRows] = await db.query(
      `
      SELECT c.id_coul, c.description_couleur, p.id_photo, ph.path_photo
      FROM produit_couleur_photo p
      LEFT JOIN couleur c ON p.id_coul = c.id_coul
      LEFT JOIN photo ph ON p.id_photo = ph.id_photo
      WHERE p.id_prod = ?
    `,
      [id]
    );

    // Structuration des données pour éviter la redondance des couleurs
    const colorsMap = new Map();

    colorsPhotosRows.forEach((item) => {
      const colorId = item.id_coul;
      if (!colorsMap.has(colorId)) {
        colorsMap.set(colorId, {
          color: {
            id: colorId,
            name: item.description_couleur,
          },
          photos: [],
        });
      }
      // Ajout de la photo à la couleur
      colorsMap.get(colorId).photos.push({
        id: item.id_photo,
        path: item.path_photo,
      });
    });

    // Conversion de la Map en tableau
    const colorsPhotos = Array.from(colorsMap.values());

    // Structuration finale des données pour les envoyer dans une réponse claire
    const produit = {
      id: rows[0].id_prod,
      productName: rows[0].nom_prod,
      unitPrice: parseFloat(rows[0].pu_prod).toFixed(2),
      addedDate: new Date(rows[0].date_ajout_prod).toISOString(),
      details: {
        description: rows[0].description_prod,
        subCategory: {
          id: rows[0].id_sous_cat,
          name: rows[0].nom_sous_cat,
        },
        style: {
          id: rows[0].id_style,
          name: rows[0].nom_style,
        },
      },
      // Matériaux du produit
      materials: materialsRows.map((material) => ({
        id: material.id_mat,
        name: material.nom_mat,
        percentage: material.pourcentage_mat,
      })),
      // Tailles du produit
      sizes: sizesRows.map((size) => ({
        id: size.id_taille,
        value: size.valeur_taille,
      })),
      // Couleurs et photos associées sans redondance
      colorsPhotos,
    };

    // Envoi des données au frontend
    res.status(200).json(produit);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du produit", error });
  }
};

// Créer un nouveau produit
const createProduit = async (req, res) => {
  const {
    name, // nom_prod dans la base de données
    pricePerUnit, // pu_prod dans la base de données
    description, // description_prod dans la base de données
    subCategoryId, // id_sous_cat dans la base de données
    styleId, // id_style dans la base de données
  } = req.body;

  try {
    // 1. Insérer le produit dans la table produit
    const [result] = await db.query(
      `
      INSERT INTO produit (nom_prod, pu_prod, description_prod, id_sous_cat, id_style) 
      VALUES (?, ?, ?, ?, ?)
    `,
      [name, pricePerUnit, description, subCategoryId, styleId]
    );

    // 2. Récupérer l'ID du produit inséré
    const produitId = result.insertId;

    // 3. Créer une réponse pour renvoyer les données du produit et ses variantes
    const createdProduit = {
      id: produitId,
      name,
      pricePerUnit,
      description,
      subCategoryId,
      styleId,
    };

    res.status(201).json({
      message:
        "Produit créé avec ses variantes de taille, couleur et quantité.",
      produit: createdProduit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création du produit", error });
    console.log(error);
  }
};

// Mettre à jour un produit par ID (mise à jour partielle)
const updateProduit = async (req, res) => {
  const { id } = req.params;
  const {
    name, // nom_prod dans la base de données
    pricePerUnit, // pu_prod dans la base de données
    description, // description_prod dans la base de données
    subCategoryId, // id_sous_cat dans la base de données
    styleId, // id_style dans la base de données
  } = req.body;

  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push("nom_prod = ?");
    values.push(name);
  }

  if (pricePerUnit !== undefined) {
    updates.push("pu_prod = ?");
    values.push(pricePerUnit);
  }

  if (description !== undefined) {
    updates.push("description_prod = ?");
    values.push(description);
  }

  if (subCategoryId !== undefined) {
    updates.push("id_sous_cat = ?");
    values.push(subCategoryId);
  }

  if (styleId !== undefined) {
    updates.push("id_style = ?");
    values.push(styleId);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour" });
  }

  values.push(id);

  const sql = `UPDATE produit SET ${updates.join(", ")} WHERE id_prod = ?`;

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    const updatedProduit = {
      id,
      name: name !== undefined ? name : undefined,
      pricePerUnit: pricePerUnit !== undefined ? pricePerUnit : undefined,
      description: description !== undefined ? description : undefined,
      subCategoryId: subCategoryId !== undefined ? subCategoryId : undefined,
      styleId: styleId !== undefined ? styleId : undefined,
    };

    res.status(200).json({
      message: "Produit mis à jour",
      produit: updatedProduit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du produit", error });
  }
};

// Supprimer un produit par ID
const deleteProduit = async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection(); // Obtenir une connexion à la base de données
  try {
    await connection.beginTransaction(); // Démarrer une transaction

    // 1. Récupérer les chemins des photos associées au produit
    const [photos] = await connection.query(
      `SELECT ph.id_photo, ph.path_photo FROM produit p
       JOIN produit_couleur_photo pcp ON p.id_prod = pcp.id_prod
       JOIN photo ph ON pcp.id_photo = ph.id_photo
       WHERE p.id_prod = ?`,
      [id]
    );

    // 2. Supprimer le produit de la base de données
    const [result] = await connection.query(
      "DELETE FROM produit WHERE id_prod = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // 3. Supprimer les fichiers photo du système de fichiers
    for (const photo of photos) {
      const filePath = path.join(__dirname, "..", photo.path_photo);
      try {
        await fs.unlink(filePath); // Utilisation de la promesse pour la suppression
        // 4. Supprimer la photo de la base de données
        await connection.query("DELETE FROM photo WHERE id_photo = ?", [
          photo.id_photo,
        ]);
      } catch (err) {
        console.error(
          `Erreur lors de la suppression de la photo : ${photo.path_photo}`,
          err
        );
        await connection.rollback(); // Annuler la transaction en cas d'erreur
        return res.status(500).json({
          message: "Erreur lors de la suppression des photos",
          error: err,
        });
      }
    }

    await connection.commit(); // Valider la transaction
    res
      .status(200)
      .json({ message: "Produit et photos supprimés avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit :", error);
    await connection.rollback(); // Annuler la transaction en cas d'erreur générale
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du produit", error });
  } finally {
    connection.release(); // Libérer la connexion
  }
};

module.exports = {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
};
