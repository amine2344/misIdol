const axios = require("axios");

const createShipment = async (req, res) => {
  const { uuid, items, currency } = req.body;

  console.log("Received request data:", req.body);

  try {
    // Prepare the shipment data based on the request
    const shipmentData = {
	    sender: { "uuid": "aa468111-0ee9-4423-8266-18c20981e1b3" },
      recipient: { uuid }, // Adjust recipient UUID if necessary
      deliveryType: "W2D",
      weight: 120, // Example weight, adjust dynamically if needed
      length: 20,  // Example dimensions, modify as needed
      width: 70,
      height: 70,
      postPay: 1000,
      recommended: false,
      sms: true,
      paidByRecipient: true,
      description: "Product description here",
      parcels: items.map(item => ({
        name: "Parcel",
        weight: 100, // Example parcel weight
        length: 70,  // Parcel dimensions, modify as needed
        width: 20,
        height: 20,
        declaredPrice: 1000
      }))
    };

    console.log("Prepared shipment data:", shipmentData);

    // Make the API call to Ukrposhta
    const response = await axios.post(
      `https://dev.ukrposhta.ua/ecom/0.0.1/shipments?token=0d33990a-c2a6-48f7-8559-d07d6346122a`,
      shipmentData,
      {
        headers: {
          accept: "*/*",
          Authorization: "Bearer 47a794af-abe6-3398-a50d-c481f6915b85",
          "Content-Type": "application/json"
        }
      }
    );
	console.log(response);
    // Successful response
    return res.status(response.status).json({
      message: "Shipment created successfully",
      status: response.status,
      shipmentId: response.data.shipmentId,
      shipmentData: response.data
    });
  } catch (error) {
    console.error("Error creating shipment:", error);

    // Handle API errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        message: `Ukrposhta API Error: ${data.message || error.message}`,
        status: status,
        details: data
      });
    }

    // Handle other errors
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};
const cancelShipment = async (req, res) => {
  const { shipmentUuid } = req.params;
  const token = "0d33990a-c2a6-48f7-8559-d07d6346122a"; 
  const bearerToken = "47a794af-abe6-3398-a50d-c481f6915b85"; 
  const url = `https://dev.ukrposhta.ua/ecom/0.0.1/shipments/${shipmentUuid}?token=${token}`;

  try {
  
    const response = await axios.delete(url, {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    if (response.status === 200) {
      res.status(200).json({ message: "Shipment successfully canceled." });
    } else {
      res.status(400).json({ error: "Failed to cancel shipment. Please try again." });
    }
  } catch (err) {
    console.error("Error canceling shipment:", err);
    res.status(500).json({ error: "Failed to cancel shipment. Please try again." });
  }
};
const getShipmentStatus = async (req, res) => {
  const { senderUuid } = req.query; // Extract senderUuid from query parameters

	console.log("serder uuid");
	console.log(senderUuid);
  if (!senderUuid) {
    return res.status(400).json({
      message: "Sender UUID is required."
    });
  }

  try {
    // Make the API call to Ukrposhta to fetch shipment status
    const response = await axios.get(
      `https://dev.ukrposhta.ua/ecom/0.0.1/shipments`,
      {
        params: {
          token: '0d33990a-c2a6-48f7-8559-d07d6346122a',
          senderUuid: senderUuid
        },
        headers: {
          accept: "*/*",
          Authorization: "Bearer 47a794af-abe6-3398-a50d-c481f6915b85"
        }
      }
    );
	console.log(response);
    // Return the shipment status response
    return res.status(response.status).json({
      message: "Shipments fetched successfully",
      shipmentData: response.data
    });
  } catch (error) {
    console.error("Error fetching shipment status:", error);

    // Handle error from API response
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        message: `Ukrposhta API Error: ${data.message || error.message}`,
        status: status,
        details: data
      });
    }

    // Handle any other unexpected errors
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

module.exports = { createShipment ,getShipmentStatus,cancelShipment};

