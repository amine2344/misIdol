const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const pool = require("../utils/db_config");
dotenv.config();

function updateLastActivity(sessionId) {
  const sql = `UPDATE session SET derniere_activite_session = ? WHERE id_session = ?`;
  const values = [new Date(), sessionId];

  return pool
    .query(sql, values)
    .then((result) => {
      if (result[0].affectedRows === 0) {
        console.error(`Aucune mise à jour pour la session: ${sessionId}`);
      } else {
        console.log(
          `Dernière activité mise à jour avec succès pour la session: ${sessionId}`
        );
      }
    })
    .catch((err) => {
      console.error(
        "Erreur lors de la mise à jour de la dernière activité:",
        err
      );
    });
}

const authJwt = async (req, res, next) => {
  const sessionId = req.cookies.session_id;

  if (!sessionId) {
    return res
      .status(401)
      .json({ message: "Session manquante. Veuillez vous connecter." });
  }

  console.log("Session ID:", sessionId); // Log the session ID to verify it's being passed correctly

  const sql =
    "SELECT token, date_expiration_session FROM session WHERE id_session = ?";

  try {
    const [results] = await pool.query(sql, [sessionId]);

    if (results.length === 0) {
      return res.status(401).json({
        message: "Session invalide ou expirée. Veuillez vous reconnecter.",
      });
    }

    const { token, date_expiration_session } = results[0];
    console.log(results[0]);
    console.log("expiration : ", date_expiration_session);
    console.log("maintenant : ", new Date());
    // Vérifier si la session a expiré
    if (new Date() > new Date(date_expiration_session)) {
      return res.status(401).json({
        message: "Session expirée. Veuillez vous reconnecter.",
      });
    }

    // Vérification du token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
      }

      // Stocker les informations d'admin dans req.admin
      req.admin = decoded.admin;

      // Mettre à jour l'activité de la session
      updateLastActivity(sessionId);

      next();
    });
  } catch (err) {
    console.error("Erreur lors de l'exécution de la requête SQL :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

const validateResetToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token manquant" });
  }

  try {
    // Vérifier si le token est valide et présent dans la base de données
    const sql =
      "SELECT token, date_expiration_session FROM session WHERE token = ?";
    const [results] = await pool.query(sql, [token]);

    if (results.length === 0) {
      return res.status(400).json({ message: "Token invalide ou inexistant" });
    }

    const { expiration } = results[0];

    // Vérifier si le token a expiré
    if (new Date() > new Date(expiration)) {
      return res.status(400).json({ message: "Token expiré" });
    }

    // Si tout est valide, envoyer une réponse de succès
    return res.status(200).json({ message: "Token valide" });
  } catch (error) {
    console.error("Erreur lors de la validation du token :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
module.exports = { authJwt, validateResetToken };
