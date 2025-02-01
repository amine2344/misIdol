const cors = require('cors');
const express = require("express");
const router = express.Router();
const connection = require("../utils/db_config"); // Connexion à la base de données
const axios = require("axios");
const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // Assurez-vous que votre clé API est définie dans les variables d'environnement

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Route pour récupérer les catégories filtrées par sectionId
router.get("/categorie/filtredBySection",cors(),  async (req, res) => {
  const { sectionId } = req.query;

  try {
    const [categories] = await connection.query(
      "SELECT * FROM categorie WHERE id_sec = ?",
      [sectionId]
    );

    res.status(200).json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/sous-categorie/filtredByCategorie", cors(), async (req, res) => {
  const { categorieId } = req.query;

  try {
    const [subCategories] = await connection.query(
      "SELECT * FROM sous_categorie WHERE id_cat = ?",
      [categorieId]
    );

    res.status(200).json(subCategories);
  } catch (error) {
    console.error("Erreur lors de la récupération des sous-catégories:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/client/produits", cors(), async (req, res) => {
  try {
    const { category, priceMax, size, color, material, subcategory, section } =
      req.query;

    // Convertir les paramètres en tableaux s'ils ne le sont pas déjà
    const parseQueryParam = (param) =>
      Array.isArray(param) ? param : param ? [param] : [];
    const categories = parseQueryParam(category);
    const subcategories = parseQueryParam(subcategory);
    const sections = parseQueryParam(section);
    const sizes = parseQueryParam(size);
    const colors = parseQueryParam(color);
    const materials = parseQueryParam(material);

    let query = `SELECT p.id_prod, p.nom_prod, p.pu_prod, p.description_prod, p.date_ajout_prod, 
                        p.id_sous_cat, p.id_style, 
                        c.nom_cat, sec.nom_sec,
                        t.id_taille, col.id_coul, m.id_mat, 
                        pcp.photo_url
                 FROM produit p
               
                 LEFT JOIN categorie c ON p.id_sous_cat = c.id_cat
                 LEFT JOIN section sec ON c.id_sec = sec.id_sec
                 LEFT JOIN produit_taille pt ON p.id_prod = pt.id_prod
                 LEFT JOIN taille t ON pt.id_taille = t.id_taille
                 LEFT JOIN produit_couleur_photo pcp ON p.id_prod = pcp.id_prod
                 LEFT JOIN couleur col ON pcp.id_coul = col.id_coul
                 LEFT JOIN materiel_produit mp ON p.id_prod = mp.id_prod
                 LEFT JOIN materiel m ON mp.id_mat = m.id_mat
                 LEFT JOIN photo pi ON pcp.id_photo = pi.id_photo
                 WHERE 1=1`;

    const params = [];

    // Apply filters
    if (priceMax) {
      query += " AND p.pu_prod <= ?";
      params.push(priceMax);
    }

    if (categories.length > 0) {
      query += " AND c.id_cat IN (?)";
      params.push(categories);
    }

    if (subcategories.length > 0) {
      query += " AND sc.id_sous_cat IN (?)";
      params.push(subcategories);
    }

    if (sections.length > 0) {
      query += " AND sec.id_sec IN (?)";
      params.push(sections);
    }

    if (sizes.length > 0) {
      query += " AND t.id_taille IN (?)";
      params.push(sizes);
    }

    if (colors.length > 0) {
      query += " AND col.id_coul IN (?)";
      params.push(colors);
    }

    if (materials.length > 0) {
      query += " AND m.id_mat IN (?)";
      params.push(materials);
    }

    const [rows] = await connection.query(query, params);

    if (rows.length === 0) {
      return res.status(200).json({ message: "Aucun produit trouvé." });
    }

    const formatProducts = (rows) => {
      return rows.reduce((acc, product) => {
        let existingProduct = acc.find(
          (p) => p.productId === product.id_prod
        );

        if (existingProduct) {
          if (
            product.id_taille &&
            !existingProduct.sizes.some(
              (size) => size.sizeId === product.id_taille
            )
          ) {
            existingProduct.sizes.push({
              sizeId: product.id_taille,
              sizeName: product.nom_sous_cat,
            });
          }
          if (
            product.id_coul &&
            !existingProduct.colors.some(
              (color) => color.colorId === product.id_coul
            )
          ) {
            existingProduct.colors.push({
              colorId: product.id_coul,
              colorName: product.nom_sous_cat,
            });
          }
          if (product.photo_url && !existingProduct.photos.cover) {
            existingProduct.photos.cover = product.photo_url;
          }
        } else {
          acc.push({
            productId: product.id_prod,
            productName: product.nom_prod,
            productPrice: product.pu_prod,
            productDescription: product.description_prod,
            stockQuantity: product.id_sous_cat, // Assuming this is a field for stock quantity
            photos: {
              cover: product.photo_url ? product.photo_url : null,
            },
            sizes: product.id_taille
              ? [{ sizeId: product.id_taille, sizeName: product.nom_sous_cat }]
              : [],
            colors: product.id_coul
              ? [{ colorId: product.id_coul, colorName: product.nom_sous_cat }]
              : [],
            materials: product.id_mat
              ? [
                  {
                    materialId: product.id_mat,
                    materialName: product.nom_sous_cat,
                  },
                ]
              : [],
          });
        }

        return acc;
      }, []);
    };

    return res.status(200).json(formatProducts(rows));
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits filtrés :",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
});
router.get("/availableSizes/:id", cors(), async (req, res) => {
  try {
    const { id } = req.params; // Get the product ID from the URL parameters

    // SQL query with JOIN to get available sizes and their respective valeur_taille
    const query = `
      SELECT DISTINCT t.id_taille, t.valeur_taille
      FROM produit_taille pt
      JOIN taille t ON pt.id_taille = t.id_taille
      WHERE pt.id_prod = ?
    `;

    // Execute the SQL query to get the available sizes with their respective valeur_taille
    const [rows] = await connection.query(query, [id]);

    console.log("Product ID:", id);
    console.log("Query Result:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        message: `No available sizes found for product ID: ${id}`,
      });
    }

    // Map the results to include the size ID and the size value
    const availableSizes = rows.map((row) => ({
      sizeId: row.id_taille,
      sizeValue: row.valeur_taille,
    }));

    // Send the available sizes with their values as a response
    return res.status(200).json({
      id_prod: id,
      availableSizes: availableSizes,
    });
  } catch (error) {
    console.error("Error fetching available sizes:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

router.get("/product_photos/:id", cors(), async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT photo_url
      FROM produit_couleur_photo
      WHERE id_prod = ?
    `;
    const [rows] = await connection.query(query, [id]);

    console.log("Product ID:", id);
    console.log("Query Result:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        message: `No photos found for id_prod: ${id}`,
      });
    }

    const photoUrls = rows.map((row) => row.photo_url);
    return res.status(200).json({
      id_prod: id,
      photos: photoUrls,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});


router.get("/client/produit/:id",cors(),  async (req, res) => {
  try {
    const { id } = req.params;

    const query = `SELECT 
          p.id_prod AS product_id, 
          p.nom_prod AS product_name, 
          p.description_prod AS product_description, 
          p.pu_prod AS product_price, 
          col.id_coul AS color_id, 
          col.description_couleur AS color_name,
          col.hexa_value AS color_hex,
          col.photo_path AS color_photo_path,  
          ph.id_photo AS photo_id, 
          ph.path_photo AS photo_path, 
          ph.is_prod_cover AS cover, 
          ph.is_prod_cover_on_hover AS cover_hover, 
          t.id_taille AS size_id, 
          t.valeur_taille AS size_name,
          pct.id AS size_table_id, 
          pct.quantite AS quantity,  
          m.id_mat AS material_id, 
          m.nom_mat AS material_name,
          pm.pourcentage_mat AS material_percentage
        FROM produit p
        LEFT JOIN produit_couleur_photo pcp ON p.id_prod = pcp.id_prod
        LEFT JOIN couleur col ON pcp.id_coul = col.id_coul
        LEFT JOIN photo ph ON pcp.id_photo = ph.id_photo
        LEFT JOIN produit_taille_couleur_quantite pct ON pcp.id_coul = pct.id_coul AND p.id_prod = pct.id_prod
        LEFT JOIN taille t ON pct.id_taille = t.id_taille
        LEFT JOIN materiel_produit pm ON p.id_prod = pm.id_prod
        LEFT JOIN materiel m ON pm.id_mat = m.id_mat
        WHERE p.id_prod = ?`;

    const [rows] = await connection.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produit non trouvé." });
    }

    const product = {
      productId: rows[0].product_id,
      productName: rows[0].product_name,
      productDescription: rows[0].product_description,
      productPrice: rows[0].product_price,
      colors: [],
      materials: [],
    };

    rows.forEach((row) => {
      const colorIndex = product.colors.findIndex(
        (color) => color.colorId === row.color_id
      );

      if (row.color_id) {
        if (colorIndex === -1) {
          product.colors.push({
            colorId: row.color_id,
            colorName: row.color_name,
            colorHex: `${row.color_hex}`,
            colorPhotoPath: row.color_photo_path,
            colorPhotos: [],
            sizes: [],
          });
        }

        if (row.size_id) {
          const sizeData = {
            id: row.size_table_id, // Ajout de l'ID de la table produit_taille_couleur_quantite
            sizeId: row.size_id,
            sizeName: row.size_name,
            quantity: row.quantity,
          };

          const currentColor =
            product.colors[
              colorIndex === -1 ? product.colors.length - 1 : colorIndex
            ];

          if (
            !currentColor.sizes.some((size) => size.sizeId === sizeData.sizeId)
          ) {
            currentColor.sizes.push(sizeData);
          }
        }

        if (row.photo_id) {
          const photoData = {
            photoId: row.photo_id,
            photoPath: row.photo_path,
            cover: !!row.cover,
            coverHover: !!row.cover_hover,
          };

          const currentColor =
            product.colors[
              colorIndex === -1 ? product.colors.length - 1 : colorIndex
            ];

          if (
            !currentColor.colorPhotos.some(
              (photo) => photo.photoId === photoData.photoId
            )
          ) {
            currentColor.colorPhotos.push(photoData);
          }
        }
      }

      const materialIndex = product.materials.findIndex(
        (material) => material.materialId === row.material_id
      );

      if (row.material_id) {
        if (materialIndex === -1) {
          product.materials.push({
            materialId: row.material_id,
            materialName: row.material_name,
            materialPercentage: row.material_percentage,
          });
        }
      }
    });

    return res.status(200).json(product);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.get("/client/currency",cors(),  async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.exchangeratesapi.io/v1/latest?access_key=${process.env.APIKEY_CURRENCY}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des taux de change:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des taux de change",
      error: error.message,
    });
  }
});

router.get("/client/style/:id", cors(), async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer le style associé au produit
    const styleQuery = `
      SELECT s.* FROM style s 
      JOIN produit p ON s.id_style = p.id_style
      WHERE p.id_prod = ?
    `;
    const [styleResult] = await connection.execute(styleQuery, [id]);

    // Vérifiez si un style a été trouvé
    if (styleResult.length === 0) {
      return res
        .status(404)
        .json({ message: "Aucun style trouvé pour ce produit." });
    }

    const styleId = styleResult[0].id_style; // Assurez-vous que c'est le bon champ pour l'ID du style

    // Récupérer la photo principale du style
    const mainPhotoQuery = `
      SELECT ph.id_photo AS photo_id, ph.path_photo AS photo_path
      FROM photo ph
      WHERE ph.id_style = ? AND ph.is_style_main = true
    `;
    const [mainPhotoResult] = await connection.execute(mainPhotoQuery, [
      styleId,
    ]);

    // Vérifiez si une photo principale a été trouvée
    const mainPhoto =
      mainPhotoResult.length > 0
        ? {
            photoId: mainPhotoResult[0].photo_id,
            photoPath: mainPhotoResult[0].photo_path,
          }
        : null;

    // Récupérer les autres produits associés au même style, excluant celui correspondant à l'id du paramètre
    const productsQuery = `
      SELECT 
        p.id_prod AS product_id, 
        p.nom_prod AS product_name, 
        p.pu_prod AS product_price, 
        ph.id_photo AS photo_id, 
        ph.path_photo AS photo_path,
        ph.is_prod_cover AS cover, 
        ph.is_prod_cover_on_hover AS cover_hover
      FROM produit p 
      LEFT JOIN produit_couleur_photo pcp ON p.id_prod = pcp.id_prod
      LEFT JOIN photo ph ON pcp.id_photo = ph.id_photo
      WHERE p.id_style = ? AND p.id_prod != ?
    `;
    const [productsResult] = await connection.execute(productsQuery, [
      styleId,
      id, // Exclure le produit correspondant à cet ID
    ]);

    // Formater les données de produits pour inclure la photo de couverture
    const associatedProducts = [];
    const productIds = new Set();

    productsResult.forEach((row) => {
      if (!productIds.has(row.product_id)) {
        productIds.add(row.product_id);
        associatedProducts.push({
          productId: row.product_id,
          productName: row.product_name,
          productPrice: row.product_price,
          photos: {
            cover: row.cover
              ? row.photo_path // Assurez-vous d'utiliser le bon chemin
              : null,
            coverHover: row.cover_hover
              ? row.photo_path // Même ici
              : null,
          },
        });
      }
    });

    // Retourner le style, la photo principale, et les produits associés
    res.json({
      style: styleResult[0],
      mainPhoto: mainPhoto, // Ajout de la photo principale
      associatedProducts: associatedProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/client/collections",cors(),  async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id_col AS id,
        c.nom_col AS nom,
        c.date_lancement_col AS date,
        p.path_photo AS photo
      FROM 
        collection c 
      LEFT JOIN 
        photo p ON c.id_col = p.id_col AND p.is_col_cover = 1
    `;

    // Exécuter la requête SQL
    const [collections] = await connection.execute(query);

    // Fonction pour rendre la date lisible et déterminer la saison
    const formatDateAndSeason = (dateString) => {
      const date = new Date(dateString);
      const year = date.toLocaleDateString("fr-FR", { year: "numeric" }); // Extraire l'année
      const monthIndex = date.getMonth() + 1; // Les mois sont indexés de 0 à 11

      // Déterminer la saison
      let season = "";
      if (monthIndex >= 3 && monthIndex <= 5) season = "printemps";
      else if (monthIndex >= 6 && monthIndex <= 8) season = "été";
      else if (monthIndex >= 9 && monthIndex <= 11) season = "automne";
      else season = "hiver"; // Décembre, Janvier, Février

      return `${season} ${year}`;
    };

    // Reformatage des données
    const formattedCollections = collections.map((collection) => ({
      id: collection.id,
      nom: `collection ${collection.nom} ${formatDateAndSeason(
        collection.date
      )}`, // Formater le nom
      photo: collection.photo,
    }));

    // Vérifier si des collections ont été trouvées
    if (formattedCollections.length > 0) {
      res.status(200).json(formattedCollections); // Renvoie les collections formatées
    } else {
      res.status(404).json({ message: "Aucune collection trouvée." });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des collections :", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/client/filtred",cors(),  async (req, res) => {
  const { sectionId, categorieId } = req.query;

  try {
    if (sectionId) {
      // Filtrer par section et récupérer les catégories
      const [categories] = await connection.query(
        "SELECT * FROM categorie WHERE id_sec = ?",
        [sectionId]
      );

      // Pour chaque catégorie, récupérer les sous-catégories associées
      const categoriesWithSubCategories = await Promise.all(
        categories.map(async (category) => {
          const [subCategories] = await connection.query(
            "SELECT * FROM sous_categorie WHERE id_cat = ?",
            [category.id_cat]
          );
          return {
            ...category,
            sous_categories: subCategories, // Ajout des sous-catégories à chaque objet de catégorie
          };
        })
      );

      res.status(200).json(categoriesWithSubCategories);
    } else if (categorieId) {
      // Filtrer par catégorie
      const [subCategories] = await connection.query(
        "SELECT * FROM sous_categorie WHERE id_cat = ?",
        [categorieId]
      );
      res.status(200).json(subCategories);
    } else {
      res
        .status(400)
        .json({ error: "Paramètre sectionId ou categorieId requis" });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/client/order", cors(), async (req, res) => {
  const { commandeId, produits } = req.body; // produits doit être un tableau d'objets

  try {
    // Vérifier que 'produits' est un tableau et n'est pas vide
    if (!Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ error: "Aucun produit à ajouter." });
    }

    // Préparer les requêtes d'insertion
    const insertPromises = produits.map(({ produitId, quantite }) => {
      const qte = quantite ? quantite : 1; // Valeur par défaut de 1
      if (qte <= 0) {
        return Promise.reject(
          new Error("La quantité doit être supérieure à 0.")
        );
      }
      return connection.query(
        "INSERT INTO produit_commande (id_commande, id_prod, qte_prod) VALUES (?, ?, ?)",
        [commandeId, produitId, qte]
      );
    });

    // Exécuter toutes les requêtes d'insertion
    const results = await Promise.all(insertPromises);

    // Récupérer le montant total de la commande
    const [totalPriceOrderResult] = await connection.query(
      "SELECT montant_total FROM commande WHERE id_commande = ?",
      [commandeId]
    );
    const totalPriceOrder = totalPriceOrderResult[0]?.montant_total || 0;

    res.status(201).json({
      message: "Produits ajoutés à la commande avec succès",
      produitCommandesIds: results.map((result) => result[0].insertId), // Retourner les IDs des nouvelles associations créées
      totalAmount: totalPriceOrder,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout des produits à la commande:", error);
    res.status(500).json({
      error: "Erreur lors de l'ajout des produits à la commande",
    });
  }
});

router.post("/client/send-email", cors(), async (req, res) => {
  const { email, idOrder } = req.body; // Récupérer les données du corps de la requête

  // Options pour créer un e-mail
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = {
    email: "mehdiks2002@gmail.com", // Remplacez par l'email de l'expéditeur
    name: "Mehdi Kert", // Remplacez par le nom de l'expéditeur
  };
  sendSmtpEmail.to = [{ email }]; // Destinataire
  sendSmtpEmail.subject = "Confirmation de votre commande"; // Sujet
  sendSmtpEmail.htmlContent = `
     <!DOCTYPE html>
<html>
  <body>
    <h1>Order Confirmation</h1>
    <p>
      Your purchase request has been successfully received. Thank you for your order!
    </p>
    <p>
      An email will be sent to you with a link to finalize your purchase and choose your delivery methods.
    </p>
  </body>
</html>

    `; // Contenu HTML

  // Appel à l'API pour envoyer l'e-mail
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    (data) => {
      res.status(200).json({
        message: "E-mail envoyé avec succès",
        data: JSON.stringify(data),
      });
    },
    (error) => {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
      res.status(500).json({ error: "Erreur lors de l'envoi de l'e-mail" });
    }
  );
});

router.get("/countries",cors(),  async (req, res) => {
  const options = {
    method: "GET",
    url: "https://country-state-city-search-rest-api.p.rapidapi.com/allcountries",
    headers: {
      "x-rapidapi-key": "5ff7e231ecmsh2d20945ecdb513fp1b2b19jsn640c4e3daee1",
      "x-rapidapi-host": "country-state-city-search-rest-api.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(200).json({ error });
    console.error(error);
  }
});

router.get("/stateByCountry", cors(), async (req, res) => {
  const { isoCodeCountry } = req.query; // Changer req.body en req.query
  const options = {
    method: "GET",
    url: "https://country-state-city-search-rest-api.p.rapidapi.com/states-by-countrycode",
    params: { countrycode: isoCodeCountry },
    headers: {
      "x-rapidapi-key": "5ff7e231ecmsh2d20945ecdb513fp1b2b19jsn640c4e3daee1",
      "x-rapidapi-host": "country-state-city-search-rest-api.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Utiliser le statut 500 pour une erreur serveur
  }
});

router.get("/cityByState",cors(),  async (req, res) => {
  const { countryCode, stateCode } = req.query; // Changer req.body en req.query

  const options = {
    method: "GET",
    url: "https://country-state-city-search-rest-api.p.rapidapi.com/cities-by-countrycode-and-statecode",
    params: {
      countrycode: countryCode,
      statecode: stateCode,
    },
    headers: {
      "x-rapidapi-key": "5ff7e231ecmsh2d20945ecdb513fp1b2b19jsn640c4e3daee1",
      "x-rapidapi-host": "country-state-city-search-rest-api.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(200).json({ error });
    console.error(error);
  }
});

module.exports = router;
