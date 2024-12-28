const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  forgetPassword,
  resetPassword,
} = require("../controllers/auth.controllers");
const {
  authJwt,
  validateResetToken,
} = require("../middlewares/auth.middleware");
router.post("/auth/login", login);
router.post("/auth/logout", authJwt, logout);
router.post("/auth/forget-password", forgetPassword);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/check", authJwt, async (req, res) => {
  return res.status(200).json({ data: req.admin });
});

router.post("/auth/check-token", validateResetToken, async (req, res) => {
  return res.status(200).json({ data: req.admin });
});
module.exports = router;
