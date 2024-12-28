const connection = require("../utils/db_config");

// Récupérer tous les styles
const getAllStyles = async (req, res) => {
  try {
    const [styles] = await connection.query(
      "SELECT id_style, nom_style, description_style, id_col FROM style"
    );

    const formattedStyles = styles.map((style) => ({
      id: style.id_style,
      name: style.nom_style,
      description: style.description_style,
      collectionId: style.id_col,
    }));

    res.status(200).json(formattedStyles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un style par ID
const getStyleById = async (req, res) => {
  const { styleId } = req.params;
  console.log("Style ID:", styleId); // Vérifiez que l'ID est correct

  try {
    // Première requête : récupérer les détails du style et les produits associés
    const [style] = await connection.query(
      `
      SELECT 
          s.id_style AS id, 
          s.nom_style AS name, 
          s.description_style AS description, 
          s.id_col AS collectionId, 
          GROUP_CONCAT(p.id_prod) AS productIds
      FROM 
          style s
      LEFT JOIN 
          produit p ON s.id_style = p.id_style
      WHERE 
          s.id_style = ?
      GROUP BY 
          s.id_style
      `,
      [styleId]
    );

    // Vérification si le style existe
    if (!style || style.length === 0) {
      return res.status(404).json({ message: "Style non trouvé." });
    }

    // Conversion de productIds en tableau
    const productIdsArray = style[0].productIds
      ? style[0].productIds.split(",")
      : [];

    // Deuxième requête : récupérer les photos associées à ce style
    const [photos] = await connection.query(
      `
      SELECT 
          id_photo AS id, 
          path_photo AS path, 
          name_photo AS name, 
          is_style_cover AS isCover
      FROM 
          photo
      WHERE 
          id_style = ?
      `,
      [styleId]
    );

    // Reformater les données pour le frontend
    const formattedStyle = {
      id: style[0].id, // ID du style
      name: style[0].name,
      description: style[0].description,
      collectionId: style[0].collectionId,
      products: productIdsArray.map((id) => ({ id })), // Crée un tableau d'objets pour les IDs de produits
      photos: photos.map((photo) => ({
        id: photo.id,
        path: photo.path,
        name: photo.name,
        isCover: Boolean(photo.isCover), // Convertir en booléen pour plus de clarté
      })),
    };

    res.json(formattedStyle);
  } catch (error) {
    console.error("Erreur lors de la récupération du style:", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Créer un nouveau style
const createStyle = async (req, res) => {
  const { name, description, collectionId, productIds } = req.body;

  if (!name || !description || !collectionId) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    // Insertion du style
    const [result] = await connection.query(
      "INSERT INTO style (nom_style, description_style, id_col) VALUES (?, ?, ?)",
      [name, description, collectionId]
    );

    const styleId = result.insertId;

    // Mise à jour des produits pour leur assigner le style
    if (productIds && productIds.length > 0) {
      const updateProductPromises = productIds.map(async (productId) => {
        await connection.query(
          "UPDATE produit SET id_style = ? WHERE id_prod = ?",
          [styleId, productId]
        );
      });

      await Promise.all(updateProductPromises);
    }

    res.status(201).json({
      data: {
        id: styleId,
        name,
        description,
        collectionId,
        productIds,
      },
      message: "Style créé et produits mis à jour avec succès",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un style
const updateStyle = async (req, res) => {
  const { id_style } = req.params;
  const { name, description, collectionId, productIds, photoId } = req.body;

  try {
    const updates = [];
    const params = [];

    // Vérification des champs à mettre à jour
    if (name !== undefined) {
      updates.push("nom_style = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updates.push("description_style = ?");
      params.push(description);
    }
    if (collectionId !== undefined) {
      updates.push("id_col = ?");
      params.push(collectionId);
    }

    // Mise à jour du style uniquement si des changements sont détectés
    if (updates.length > 0) {
      const query = `UPDATE style SET ${updates.join(", ")} WHERE id_style = ?`;
      params.push(id_style);
      const [result] = await connection.query(query, params);

      // Si aucun style n'est trouvé
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Style non trouvé" });
      }
    }

    // Mise à jour des produits liés au style
    if (Array.isArray(productIds)) {
      // Dissocier les produits non sélectionnés du style
      await connection.query(
        "UPDATE produit SET id_style = NULL WHERE id_style = ? AND id_prod NOT IN (?)",
        [id_style, productIds.length > 0 ? productIds : null]
      );

      // Associer les nouveaux produits au style
      if (productIds.length > 0) {
        const updateProductPromises = productIds.map(async (productId) => {
          await connection.query(
            "UPDATE produit SET id_style = ? WHERE id_prod = ?",
            [id_style, productId]
          );
        });

        await Promise.all(updateProductPromises);
      }
    } else {
      // Si productIds est vide ou non défini, dissocier tous les produits de ce style
      await connection.query(
        "UPDATE produit SET id_style = NULL WHERE id_style = ?",
        [id_style]
      );
    }

    // Mise à jour de la photo de couverture
    if (photoId) {
      // Définir toutes les photos comme non couverture pour ce style
      await connection.query(
        "UPDATE photo SET is_style_cover = false WHERE id_style = ?",
        [id_style]
      );

      // Définir la photo sélectionnée comme couverture
      await connection.query(
        "UPDATE photo SET is_style_cover = true WHERE id_photo = ?",
        [photoId]
      );

      return res
        .status(200)
        .json({ message: "Photo de couverture mise à jour avec succès" });
    }

    res.status(200).json({ message: "Style mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un style
const deleteStyle = async (req, res) => {
  const { id_style } = req.params;

  try {
    const [result] = await connection.query(
      "DELETE FROM style WHERE id_style = ?",
      [id_style]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Style non trouvé" });
    }

    res.status(200).json({ message: "Style supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStyles,
  getStyleById,
  createStyle,
  updateStyle,
  deleteStyle,
};
