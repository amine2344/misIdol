const db = require("../utils/db_config");

// Fonction utilitaire pour formater une commande
const formatCommande = (commande) => ({
  id: commande.id_commande,
  clientName: commande.nom_client,
  clientEmail: commande.email_client,
  deliveryAddress: commande.adresse_livraison,
  country: commande.pays,
  state: commande.etat,
  city: commande.ville,
  postalCode: commande.code_zip,
  phoneNumber: commande.numero_telephone,
  orderDate: commande.date_commande,
  totalAmount: commande.montant_total,
  status: commande.statut,
  clientInfo: commande.client_info,
});

// Créer une nouvelle commande
exports.createCommande = async (req, res) => {
  const {
    clientName,
    clientEmail,
    deliveryAddress,
    country,
    state,
    city,
    postalCode,
    phoneNumber,
    totalAmount,
    status,
    clientInfo,
  } = req.body;

  const query = `
    INSERT INTO commande (nom_client, email_client, adresse_livraison, pays, etat, ville, code_zip, numero_telephone, montant_total, statut, client_info)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [results] = await db.query(query, [
      clientName,
      clientEmail,
      deliveryAddress,
      country,
      state,
      city,
      postalCode,
      phoneNumber,
      totalAmount || 0.0,
      status && status !== null ? status : "pending",
      clientInfo,
    ]);

    const newCommande = formatCommande({
      id_commande: results.insertId,
      nom_client: clientName,
      email_client: clientEmail,
      adresse_livraison: deliveryAddress,
      pays: country,
      etat: state,
      ville: city,
      code_zip: postalCode,
      numero_telephone: phoneNumber,
      montant_total: totalAmount || 0.0,
      statut: status,
      client_info: clientInfo,
    });

    res.status(201).json({
      message: "Commande créée",
      commande: newCommande,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la commande" });
  }
};

// Mise à jour de la commande
exports.updateCommande = async (req, res) => {
  const { id } = req.params;
  const {
    clientName,
    clientEmail,
    deliveryAddress,
    country,
    state,
    city,
    postalCode,
    phoneNumber,
    totalAmount,
    status,
    clientInfo,
  } = req.body;

  // Initialiser une liste pour les champs à mettre à jour
  const updates = [];
  const values = [];

  if (clientName) {
    updates.push("nom_client = ?");
    values.push(clientName);
  }
  if (clientEmail) {
    updates.push("email_client = ?");
    values.push(clientEmail);
  }
  if (deliveryAddress) {
    updates.push("adresse_livraison = ?");
    values.push(deliveryAddress);
  }
  if (country) {
    updates.push("pays = ?");
    values.push(country);
  }
  if (state) {
    updates.push("etat = ?");
    values.push(state);
  }
  if (city) {
    updates.push("ville = ?");
    values.push(city);
  }
  if (postalCode) {
    updates.push("code_zip = ?");
    values.push(postalCode);
  }
  if (phoneNumber) {
    updates.push("numero_telephone = ?");
    values.push(phoneNumber);
  }
  if (totalAmount) {
    updates.push("montant_total = ?");
    values.push(totalAmount);
  }
  if (status) {
    updates.push("statut = ?");
    values.push(status);
  }
  if (clientInfo) {
    updates.push("client_info = ?");
    values.push(clientInfo);
  }

  // Vérifier s'il y a des champs à mettre à jour
  if (updates.length === 0) {
    return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
  }

  // Créer la requête de mise à jour
  const query = `
      UPDATE commande
      SET ${updates.join(", ")}
      WHERE id_commande = ?
    `;

  // Ajouter l'ID de la commande à la fin des valeurs
  values.push(id);

  try {
    const [results] = await db.query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json({
      message: "Commande mise à jour",
      commande: {
        id,
        clientName,
        clientEmail,
        deliveryAddress,
        country,
        state,
        city,
        postalCode,
        phoneNumber,
        totalAmount,
        status,
        clientInfo,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la commande" });
  }
};

// Obtenir toutes les commandes
exports.getAllCommandes = async (req, res) => {
  const query = "SELECT * FROM commande";

  try {
    const [results] = await db.query(query);
    const commandes = results.map(formatCommande);

    res.status(200).json(commandes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des commandes" });
  }
};

// Obtenir une commande par ID
exports.getCommandeById = async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM commande WHERE id_commande = ?";

  try {
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    const commande = formatCommande(results[0]);
    res.status(200).json(commande);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la commande" });
  }
};

// Supprimer une commande
exports.deleteCommande = async (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM commande WHERE id_commande = ?";

  try {
    const [results] = await db.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    res.status(200).json({ message: "Commande supprimée" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la commande" });
  }
};
