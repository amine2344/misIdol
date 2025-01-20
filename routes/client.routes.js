const cors = require('cors');
const express = require("express");
const router = express.Router();
const {
  login,fetchAddresses, createAddress,
  logout,
  getUserDetails,
  signup,
} = require("../controllers/client.controllers");

const {
  authJwt,
  validateResetToken,
} = require("../middlewares/auth.middleware");

// Middleware to enable CORS
router.use(cors());

router.get("/addresses", fetchAddresses);
router.post("/addresses", createAddress);
// Authentication routes createAddress createAddress
router.post("/auth/client-login", login);
router.post("/auth/client-logout", logout);
router.post("/auth/client-signup", signup);

// User routes
router.get("/auth/user/:userId", getUserDetails);

// Check session or token routes
router.post("/auth/check", async (req, res) => {
  return res.status(200).json({ data: req.admin });
});

router.post("/auth/check-token", validateResetToken, async (req, res) => {
  return res.status(200).json({ data: req.admin });
});

module.exports = router;

