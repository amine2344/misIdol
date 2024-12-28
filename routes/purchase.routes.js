const { default: createMollieClient } = require("@mollie/api-client");
const express = require("express");
const router = express.Router();
const db = require("../utils/db_config"); // Remplace par ton instance de base de données
const axios = require("axios");
const crypto = require("crypto");

// Créez un client Mollie avec votre clé API secrète
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

// Route pour créer un PaymentIntent

router.post("/create-payment-intent", async (req, res) => {
  const { currency, idOrder } = req.body;

  try {
    // Récupérer le montant total HT et le pays du client
    const queryGetOrder = `SELECT montant_total AS totalAmountHt, pays FROM commande WHERE id_commande = ?`;
    const [orderData] = await db.query(queryGetOrder, [idOrder]);

    if (!orderData || orderData.length === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    const { totalAmountHt, pays: countryCode } = orderData[0];
    let convertedAmountHt = parseFloat(totalAmountHt); // initialement en euros

    // Si la monnaie n'est pas l'EUR, récupérer le taux de conversion et convertir le montant
    if (currency !== "EUR") {
      const responseCurrency = await axios.get(
        `https://api.exchangeratesapi.io/v1/latest?access_key=${process.env.APIKEY_CURRENCY}`
      );
      const conversionRate = responseCurrency.data.rates[currency];
      if (!conversionRate) {
        return res.status(400).json({ error: "Devise non supportée" });
      }
      convertedAmountHt = convertedAmountHt * conversionRate; // convertir le montant HT
    }

    // Récupérer le taux de TVA pour le pays du client
    const vatResponse = await axios.get(`http://apilayer.net/api/rate`, {
      params: {
        access_key: process.env.VAT_API_KEY,
        country_code: countryCode,
      },
    });

    const vatRate = vatResponse.data.standard_rate;
    const vatAmount = parseFloat(convertedAmountHt) * (vatRate / 100);
    const totalAmountTtc = (
      parseFloat(convertedAmountHt) + parseFloat(vatAmount)
    ).toFixed(2);

    // Créer la commande de paiement dans Mollie avec le montant TTC
    const payment = await mollieClient.payments.create({
      amount: {
        value: totalAmountTtc,
        currency: currency,
      },
      description: `ORDER ${idOrder}`,
      redirectUrl: process.env.CLIENT_URL,
      webhookUrl:
        "https://623b-129-45-114-146.ngrok-free.app/api/webhook/mollie",
    });

    // Enregistrer les informations dans la table transaction
    const queryInsertTransaction = `
      INSERT INTO transaction (transaction_id, id_commande, amount_ht, amount_tva, amount_ttc, currency, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    await db.query(queryInsertTransaction, [
      payment.id, // transaction_id : ID de la transaction retourné par Mollie
      idOrder, // id_order : l'ID de la commande
      convertedAmountHt.toFixed(2), // amount_ht : montant hors taxe converti
      vatAmount.toFixed(2), // amount_tva : montant de la TVA
      totalAmountTtc, // amount_ttc : montant TTC
      currency, // currency : devise utilisée
      payment.status, // status : statut initial du paiement
    ]);

    // Retourner les informations pertinentes au client
    res.status(200).json({
      payment,
      amountHt: convertedAmountHt.toFixed(2),
      tvaRate: vatRate,
      tvaAmount: vatAmount.toFixed(2),
      totalAmountTtc,
      currency,
    });
  } catch (error) {
    console.error("Erreur lors de la création du paiement :", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/webhook/mollie", async (req, res) => {
  const paymentId = req.body.id;

  try {
    // Récupérer les informations de la transaction depuis Mollie
    const payment = await mollieClient.payments.get(paymentId);

    // Mettre à jour le statut de la transaction dans la base de données
    const queryUpdateTransaction = `
      UPDATE transaction
      SET status = ?, updated_at = NOW()
      WHERE transaction_id = ?
    `;
    await db.query(queryUpdateTransaction, [payment.status, paymentId]);

    // Envoyer une réponse à Mollie pour confirmer la réception du webhook
    res.status(200).send("Webhook reçu avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du statut de la transaction :",
      error.message
    );
    res.status(500).send("Erreur lors de la mise à jour du statut");
  }
});

// Route pour récupérer toutes les transactions avec un format personnalisé
router.get("/transactions", async (req, res) => {
  try {
    const queryGetAllTransactions = `
      SELECT transaction_id, id_commande, amount_ht, amount_tva, amount_ttc, currency, status, created_at, updated_at
      FROM transaction
    `;
    const [transactions] = await db.query(queryGetAllTransactions);

    // Mapper les données pour personnaliser le format
    const formattedTransactions = transactions.map((transaction) => ({
      transactionId: transaction.transaction_id,
      orderId: transaction.id_commande,
      amountHt: parseFloat(transaction.amount_ht).toFixed(2),
      tva: parseFloat(transaction.amount_tva).toFixed(2),
      amountTtc: parseFloat(transaction.amount_ttc).toFixed(2),
      currency: transaction.currency,
      status: transaction.status,
      createdAt: new Date(transaction.created_at).toISOString(),
      updatedAt: new Date(transaction.updated_at).toISOString(),
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des transactions :",
      error.message
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des transactions" });
  }
});

// Fonction pour générer la signature
function generateSignature(params, secretKey) {
  const values = [
    params.TRANSACTIONTYPE,
    params.MERCHANTACCOUNT,
    params.MERCHANTDOMAINNAME,
    params.ORDERREFERENCE,
    params.ORDERDATE,
    params.AMOUNT,
    params.CURRENCY,
    params.PRODUCTNAME.join(","),
    params.PRODUCTCOUNT.join(","),
    params.PRODUCTPRICE.join(","),
  ];
  const hashString = values.join(";");
  return crypto
    .createHash("md5")
    .update(hashString + secretKey)
    .digest("hex");
}

// Route pour initier le paiement par QR code
router.post("/initiate-payment", async (req, res) => {
  // Utilisation des valeurs statiques pour le test
  const params = {
    TRANSACTIONTYPE: "CREATE_QR",
    MERCHANTACCOUNT: "TEST_MERCH_N1", // Remplacez par votre ID de marchand pour test
    MERCHANTAUTHTYPE: "SIMPLESIGNATURE",
    MERCHANTDOMAINNAME: "localhost", // Votre domaine de test ou "localhost" pour un test local
    SERVICEURL: "HTTP://SERVICEURL.COM", // URL de callback pour les notifications
    ORDERREFERENCE: "DH1731468339", // Remplacez par un ID unique pour chaque commande
    ORDERDATE: 1415379863, // Exemple d'un timestamp valide
    AMOUNT: 1547.36, // Montant en test
    CURRENCY: "UAH", // Devise en test
    ORDERTIMEOUT: 49000,
    PRODUCTNAME: ["Test Product"], // Exemple de produit pour test
    PRODUCTPRICE: [1000], // Exemple de prix pour test
    PRODUCTCOUNT: [1], // Quantité pour test
    CLIENTFIRSTNAME: "John", // Nom de test
    CLIENTLASTNAME: "Doe", // Prénom de test
    CLIENTEMAIL: "john.doe@example.com", // Email de test
    CLIENTPHONE: "1234567890", // Numéro de téléphone de test
    APIVERSION: 1, // Version de l'API
  };

  // Générer la signature
  const signature = generateSignature(params, process.env.WAYFORPAY_SECRET_KEY); // Remplacez par votre clé secrète de test
  params.MERCHANTSIGNATURE = signature;

  try {
    // Envoyer la requête à WayforPay
    const response = await axios.post("https://api.wayforpay.com/api", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Renvoyer la réponse de WayforPay au frontend
    res.json(response.data);
    console.log(response);
  } catch (error) {
    console.error("Erreur lors de la requête à WayforPay:", error);
    res.status(500).json({ error: "Erreur lors de la création du paiement" });
  }
});
module.exports = router;
