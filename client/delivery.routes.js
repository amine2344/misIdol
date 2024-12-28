const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint pour créer une livraison
router.post("/create-shipment", async (req, res) => {
  const { senderUuid, recipient, weight, dimensions, declaredPrice } = req.body;

  try {
    // Envoi de la requête à l'API de livraison pour créer une expédition
    const response = await axios.post(
      `https://www.ukrposhta.ua/ecom/0.0.1/shipments`,
      {
        sender: { uuid: senderUuid },
        recipient: {
          name: recipient.name,
          address: recipient.address,
          phone: recipient.phone,
        },
        type: "PARCEL", // Type d'envoi
        weight, // Poids en grammes
        length: dimensions.length, // Longueur en cm
        width: dimensions.width,   // Largeur en cm
        height: dimensions.height, // Hauteur en cm
        declaredPrice, // Valeur déclarée
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.UKRPOSHTA_SANDBOX_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Sauvegarder les détails de la livraison dans la base de données, etc.
    console.log('Livraison créée avec succès:', response.data);

    // Retourner la réponse au client
    res.status(201).json({
      message: 'Livraison créée avec succès',
      data: response.data,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la livraison:', error.response?.data || error.message);

    // Gérer les erreurs et retourner une réponse appropriée
    res.status(500).json({
      message: 'Erreur lors de la création de la livraison',
      error: error.message,
    });
    console.log(error.response)
  }
});

module.exports = router;
