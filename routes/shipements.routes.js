
const cors = require('cors');
const express = require("express");
const router = express.Router();
const {
 createShipment, getShipmentStatus, cancelShipment
} = require("../controllers/shipements.controllers");
router.post("/create-ukr-shipment/:senderUuid", cors(),createShipment); 
router.get("/shipment-status", getShipmentStatus);
router.delete("/cancel-shipment/:shipmentUuid", cors(), cancelShipment); // Add route for shipment cancellation


module.exports = router;
