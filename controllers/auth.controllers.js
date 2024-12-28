const pool = require("../utils/db_config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4, stringify } = require("uuid");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const axios = require("axios");
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // Assurez-vous que votre clé API est définie dans les variables d'environnement

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

dotenv.config();

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

// Fonction utilitaire pour gérer les erreurs
const handleError = (res, message, err) => {
  console.error(message, err);
  res.status(500).json({ message, err });
};

const login = async (req, res) => {
  const { email, username, password } = req.body;
  console.log("body reçu");

  const sql = `SELECT id_admin , AES_DECRYPT(username, ?) as username ,AES_DECRYPT(email, ?) as email ,password
               FROM admin
               WHERE ${
                 email
                   ? "AES_DECRYPT(email, ?) = ?"
                   : "AES_DECRYPT(username, ?) = ?"
               }`;
  const values = [
    process.env.SECRET_KEY_MYSQL,
    process.env.SECRET_KEY_MYSQL,
    process.env.SECRET_KEY_MYSQL,
    email || username,
  ];

  try {
    const results = await pool.query(sql, values);
    console.log("verification si il y a un résultat");

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Email ou nom d'utilisateur invalide" });
    }

    const formatAdmin = results[0];
    console.log(formatAdmin[0]);
    console.log("verification du mot de passe");

    const verifyPassword = await bcrypt.compare(
      password,
      formatAdmin[0].password
    );
    if (!verifyPassword) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const formattedAdmin = {
      id: formatAdmin[0].id_admin,
      email: formatAdmin[0].email.toString("utf8"),
      username: formatAdmin[0].username.toString("utf8"),
      createdAt: formatAdmin[0].created_at,
    };

    const token = jwt.sign({ admin: formattedAdmin }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const sessionId = uuidv4(); // Générer un ID de session unique

    // Insérer la session dans la base de données
    const tokenExpiration = new Date(Date.now() + 24 * 3600 * 1000); // 24 heures à partir de maintenant

    // Insérer la session dans la base de données
    const sessionQuery =
      "INSERT INTO session (id_session, token, id_admin, date_creation_session, date_expiration_session, derniere_activite_session) VALUES (?, ?, ?, ?, ?, ?)";
    await pool.query(sessionQuery, [
      sessionId,
      token,
      formattedAdmin.id,
      now(),
      tokenExpiration, // Ajoutez la date d'expiration ici
      now(),
    ]);
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "false",
      maxAge: 24 * 3600000,
    });

    res.status(200).json({
      message: "Authentification réussie",
      admin: formattedAdmin,
    });
  } catch (err) {
    console.error(err); // Log de l'erreur pour le débogage
    return handleError(res, "Erreur lors de l'authentification", err);
  }
};

const logout = async (req, res) => {
  const sessionId = req.cookies.session_id;
  if (!sessionId) {
    return res.status(400).json({ message: "Aucune session active." });
  }

  const sql = "DELETE FROM session WHERE id_session = ?";
  pool.query(sql, [sessionId], (err) => {
    if (err) {
      return handleError(res, "Erreur lors de la déconnexion", err);
    }

    res.clearCookie("session_id");
    res.status(200).json({ message: "Déconnexion réussie" });
  });
};

const forgetPassword = async (req, res) => {
  const { email, captchaToken } = req.body; // Récupère le token envoyé par le frontend

  // 1. Vérification du CAPTCHA reCAPTCHA v2
  if (!captchaToken) {
    return res.status(400).json({ message: "Captcha non complété" });
  }

  try {
    // Envoi du captchaToken à Google pour vérification
    const captchaResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY, // Clé secrète reCAPTCHA
        response: captchaToken,
      })
    );

    if (!captchaResponse.data.success) {
      return res
        .status(400)
        .json({ message: "Échec de validation du CAPTCHA" });
    }

    // 2. Vérification de l'email dans la base de données
    const verifyEmailQuery = `SELECT id_admin FROM admin WHERE AES_DECRYPT(email, ?) = ?`;
    const values = [process.env.SECRET_KEY_MYSQL, email];
    const emailResult = await pool.query(verifyEmailQuery, values);

    if (emailResult.length === 0) {
      return res.status(404).json({ message: "Email non trouvé" });
    }

    const adminId = emailResult[0][0].id_admin;
    // 3. Création de la session de réinitialisation
    const resetToken = uuidv4();
    const expiration = new Date(Date.now() + 60 * 60 * 1000); // Expiration dans 1 heure

    const createResetSessionQuery = `
      INSERT INTO session (id_session, id_admin, token, date_expiration_session)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(createResetSessionQuery, [
      resetToken,
      adminId,
      resetToken,
      expiration,
    ]);

    // 4. Envoi de l'email avec le lien de réinitialisation
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: "mehdiks2002@gmail.com",
      name: "Mehdi Kert",
    };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = "Réinitialisation de mot de passe";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Réinitialisation de votre mot de passe</h1>
          <p>
            Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe.
          </p>
          <a href="http://localhost:5173/reset-password?token=${resetToken}">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien expirera dans 1 heure.</p>
        </body>
      </html>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res
      .status(200)
      .json({ success: true, message: "Email de réinitialisation envoyé" });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", err);
    return res
      .status(500)
      .json({ message: "Erreur lors de la réinitialisation du mot de passe" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  console.log("token", token);
  try {
    // Vérifier si la session de réinitialisation existe
    const query = `SELECT id_admin, date_expiration_session FROM session WHERE token = ?`;
    const [session] = await pool.query(query, [token]);

    if (session.length === 0) {
      return res
        .status(400)
        .json({ message: "Session de réinitialisation invalide ou expirée" });
    }

    // Vérifier si la session a expiré
    const currentTime = new Date();
    if (currentTime > new Date(session[0].date_expiration_session)) {
      return res.status(400).json({ message: "Le lien a expiré" });
    }

    // Mettre à jour le mot de passe de l'utilisateur
    const hashedPassword = bcrypt.hashSync(newPassword, 10); // Utilisez bcrypt pour hasher le mot de passe
    const updatePasswordQuery = `UPDATE admin SET password = ? WHERE id_admin = ?`;
    await pool.query(updatePasswordQuery, [
      hashedPassword,
      session[0].id_admin,
    ]);

    // Supprimer la session de réinitialisation
    const deleteSessionQuery = `DELETE FROM session WHERE token = ?`;
    await pool.query(deleteSessionQuery, [token]);

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  login,
  logout,
  forgetPassword,
  resetPassword,
};
