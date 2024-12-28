// Création d'une nouvelle livraison
const db = require("../utils/db_config");

const axios = require("axios");

exports.createLivraison = async (req, res) => {
  const {
    name_expeditor,
    adress_expeditor,
    city_expeditor,
    state_expeditor,
    zip_expeditor,
    country_expeditor,
    phone_expeditor,
    width,
    height,
    length,
    weight,
  } = req.body;
  const { idOrder } = req.params;

  const sqlInsertLivraison = `
    INSERT INTO livraison (name_expeditor, adress_expeditor, city_expeditor, state_expeditor, zip_expeditor, country_expeditor, phone_expeditor, width, height, length, weight , id_commande)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)
  `;
  const valuesLivraison = [
    name_expeditor,
    adress_expeditor,
    city_expeditor,
    state_expeditor,
    zip_expeditor,
    country_expeditor,
    phone_expeditor,
    width,
    height,
    length,
    weight,
    idOrder,
  ];

  try {
    // Insertion dans la base de données
    const results = await db.query(sqlInsertLivraison, valuesLivraison);
    const livraisonId = results.insertId;

    // Récupération des données du receveur
    const sqlFetchReceiver = "SELECT * FROM commande WHERE id_commande = ?";
    const receiverResults = await db.query(sqlFetchReceiver, [idOrder]);

    if (receiverResults.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée." });
    }

    const receiver = receiverResults[0];
    // Préparer les données pour Shippo
    const shipmentData = {
      address_from: {
        name: name_expeditor,
        street1: adress_expeditor,
        city: city_expeditor,
        state: state_expeditor,
        zip: zip_expeditor,
        country: country_expeditor,
        phone: phone_expeditor,
      },
      address_to: {
        name: receiver[0].nom_client,
        street1: receiver[0].adresse_livraison,
        city: receiver[0].ville,
        state: receiver[0].etat,
        zip: receiver[0].code_zip,
        country: receiver[0].pays,
        phone: receiver[0].numero_telephone,
      },
      parcels: [
        {
          length: length.toString(),
          width: width.toString(),
          height: height.toString(),
          distance_unit: "in",
          weight: weight.toString(),
          mass_unit: "lb",
        },
      ],
      async: false,
    };

    // Créer l'expédition dans Shippo avec Axios
    const response = await axios.post(
      "https://api.goshippo.com/shipments/",
      shipmentData,
      {
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`, // Remplacez <API_TOKEN> par votre véritable token
          "Content-Type": "application/json",
        },
      }
    );
    if (response) {
      return res.status(201).json({
        message: "Livraison créée avec succès et expédition créée dans Shippo.",
        livraisonId: livraisonId,
        shipmentId: response.data.object_id, // Récupérez l'ID de l'expédition depuis la réponse de Shippo
        rates: response.data.rates,
      });
    }
  } catch (error) {
    console.error("Error: ");
    return res.status(500).json({
      error: "Erreur lors de la création de la livraison ou de l'expédition.",
      details: error.response ? error.response.data : error.message,
    });
  }
};

// Récupérer toutes les livraisons
exports.getAllLivraisons = (req, res) => {
  const sql = "SELECT * FROM livraison";

  db.query(sql, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des livraisons." });
    }
    res.json(results);
  });
};

// Récupérer une livraison par ID
exports.getLivraisonById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM livraison WHERE livraison_id = ?";

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération de la livraison." });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Livraison non trouvée." });
    }
    res.json(results[0]);
  });
};

// Mettre à jour une livraison
exports.updateLivraison = (req, res) => {
  const { id } = req.params;
  const {
    name_expeditor,
    adress_expeditor,
    city_expeditor,
    state_expeditor,
    zip_expeditor,
    country_expeditor,
    phone_expeditor,
  } = req.body;

  const sql = `
    UPDATE livraison SET
      name_expeditor = ?, adress_expeditor = ?, city_expeditor = ?, state_expeditor = ?,
      zip_expeditor = ?, country_expeditor = ?, phone_expeditor = ?
    WHERE livraison_id = ?
  `;
  const values = [
    name_expeditor,
    adress_expeditor,
    city_expeditor,
    state_expeditor,
    zip_expeditor,
    country_expeditor,
    phone_expeditor,
    id,
  ];

  db.query(sql, values, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la mise à jour de la livraison." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Livraison non trouvée." });
    }
    res.json({ message: "Livraison mise à jour avec succès." });
  });
};

// Supprimer une livraison
exports.deleteLivraison = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM livraison WHERE livraison_id = ?";

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la suppression de la livraison." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Livraison non trouvée." });
    }
    res.json({ message: "Livraison supprimée avec succès." });
  });
};
