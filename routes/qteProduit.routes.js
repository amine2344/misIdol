const router = require("express").Router();
const cors = require('cors');
const connection = require("../utils/db_config");

router.post("/qteProduit",cors(), async (req, res) => {
  const { idProd, idTaille, idCoul, quantite } = req.body;

  // Validation des données reçues
  if (!idProd || !idTaille || !idCoul || quantite === undefined) {
    return res.status(400).json({
      message:
        "Les paramètres idProd, idTaille, idCoul et quantite sont requis.",
    });
  }

  try {
    // Vérifier si l'enregistrement existe déjà dans produit_taille_couleur_quantite
    const [existing] = await connection.query(
      `
            SELECT * FROM produit_taille_couleur_quantite 
            WHERE id_prod = ? AND id_taille = ? AND id_coul = ?
          `,
      [idProd, idTaille, idCoul]
    );

    if (existing.length > 0) {
      // Si l'enregistrement existe, mettez à jour la quantité
      const updatedQuantity = existing[0].quantite + quantite; // Ajuster selon la quantité
      await connection.query(
        `
              UPDATE produit_taille_couleur_quantite 
              SET quantite = ? 
              WHERE id_prod = ? AND id_taille = ? AND id_coul = ?
            `,
        [updatedQuantity, idProd, idTaille, idCoul]
      );

      return res.status(200).json({
        message: "Quantité mise à jour avec succès.",
        updatedQuantity,
      });
    } else {
      // Si l'enregistrement n'existe pas, créer un nouvel enregistrement
      await connection.query(
        `
              INSERT INTO produit_taille_couleur_quantite (id_prod, id_taille, id_coul, quantite) 
              VALUES (?, ?, ?, ?)
            `,
        [idProd, idTaille, idCoul, quantite]
      );

      return res.status(201).json({
        message: "Quantité ajoutée avec succès.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de l'ajout de la quantité au produit.",
      error,
    });
  }
});

// GET /qteProduit
router.get("/qteProduit",cors(), async (req, res) => {
  const { idProd, idTaille, idCoul } = req.query; // Extract query parameters

  try {
    let query = `
        SELECT 
          id as id ,
          ptcq.quantite,
          p.nom_prod AS produit_nom, 
          t.valeur_taille AS taille_nom, 
          c.description_couleur AS couleur_nom 
        FROM produit_taille_couleur_quantite ptcq
        JOIN produit p ON ptcq.id_prod = p.id_prod
        JOIN taille t ON ptcq.id_taille = t.id_taille
        JOIN couleur c ON ptcq.id_coul = c.id_coul
      `;
    const params = [];

    // Add WHERE conditions based on provided query parameters
    const conditions = [];

    if (idProd) {
      conditions.push("ptcq.id_prod = ?");
      params.push(idProd);
    }
    if (idTaille) {
      conditions.push("ptcq.id_taille = ?");
      params.push(idTaille);
    }
    if (idCoul) {
      conditions.push("ptcq.id_coul = ?");
      params.push(idCoul);
    }

    // Append conditions to the query if any
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [results] = await connection.query(query, params);

    if (results.length === 0) {
      return res.status(404).json({
        message: "Aucune quantité trouvée pour les critères fournis.",
      });
    }

    // Transform the results into a custom format
    const formattedResults = results.map((item) => ({
      id: item.id,
      productName: item.produit_nom, // Mapping to a new key
      sizeName: item.taille_nom, // Mapping to a new key
      colorName: item.couleur_nom, // Mapping to a new key
      quantity: item.quantite, // Retaining the quantity with a new key
    }));

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des quantités.",
      error,
    });
  }
});

router.get("/productIds",cors(), async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT id_prod, nom_prod FROM produit"
    );

    // Transformer le format des données
    const formattedRows = rows.map((row) => ({
      id: row.id_prod, // Renommer id_prod à id
      name: row.nom_prod, // Renommer nom_prod à name
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des produits", error });
  }
});

router.post("/qteProduit-order/:idOrder",cors(), async (req, res) => {
  const { idOrder } = req.params;
  const { products } = req.body; // Tableau de produits et quantités [{idProd, qte}, ...]

  let db;
  console.log("Produits reçus :", products);
  try {
    // Obtenir une connexion à partir du pool
    db = await connection.getConnection();

    // Démarrer une transaction
    await db.beginTransaction();

    // Boucle à travers les produits reçus
    for (const { idProd, qte } of products) {
      // Vérifier si le produit existe déjà dans la commande
      const checkQuery = `
        SELECT qte_prod FROM produit_commande 
        WHERE id_commande = ? AND id_prod = ?
      `;

      const [existingProduct] = await db.query(checkQuery, [idOrder, idProd]);

      if (existingProduct.length > 0) {
        // Si le produit existe, mettre à jour la quantité
        const newQte = existingProduct[0].qte_prod + qte;
        const updateQuery = `
          UPDATE produit_commande 
          SET qte_prod = ? 
          WHERE id_commande = ? AND id_prod = ?
        `;
        await db.query(updateQuery, [newQte, idOrder, idProd]);
      } else {
        // Si le produit n'existe pas, l'insérer
        const insertQuery = `
          INSERT INTO produit_commande (id_commande, id_prod, qte_prod) VALUES (?, ?, ?)
        `;
        await db.query(insertQuery, [idOrder, idProd, qte]);
      }
    }

    // Valider la transaction
    await db.commit();
    res
      .status(201)
      .json({ message: "Produits ajoutés à la commande avec succès." });
  } catch (error) {
    if (db) await db.rollback(); // Annule la transaction en cas d'erreur
    console.error("Erreur lors de l'ajout de produits à la commande :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout des produits.", error });
  } finally {
    if (db) db.release(); // Libérer la connexion
  }
});

router.get("/commande/:idOrder/produits",cors(), async (req, res) => {
  const { idOrder } = req.params;

  try {
    const query = `
      SELECT 
        cp.id_commande AS commande_id,
        ptcq.id AS ptcq_id,
        p.nom_prod AS produit_nom,
        c.description_couleur AS couleur_nom,
        t.valeur_taille AS taille_nom,
        ptcq.quantite AS quantite_en_stock,
        cp.qte_prod AS quantite_commandee
      FROM produit_commande cp
      JOIN produit_taille_couleur_quantite ptcq ON cp.id_prod = ptcq.id
      JOIN produit p ON ptcq.id_prod = p.id_prod
      JOIN couleur c ON ptcq.id_coul = c.id_coul
      JOIN taille t ON ptcq.id_taille = t.id_taille
      WHERE cp.id_commande = ?
    `;

    const [results] = await connection.query(query, [idOrder]);

    if (results.length === 0) {
      return res.status(404).json({
        message: "Aucun produit trouvé pour cette commande.",
      });
    }

    // Formater les résultats pour le frontend
    const formattedResults = results.map((item) => ({
      commandeId: item.commande_id,
      ptcqId: item.ptcq_id,
      productName: item.produit_nom,
      colorName: item.couleur_nom,
      sizeName: item.taille_nom,
      quantityInStock: item.quantite_en_stock,
      quantityOrdered: item.quantite_commandee,
    }));

    return res.status(200).json(formattedResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des produits de la commande.",
      error,
    });
  }
});

module.exports = router;
