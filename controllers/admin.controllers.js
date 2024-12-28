const db = require("../utils/db_config");

const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10; // Nombre de rounds pour le hachage

// Récupérer tous les administrateurs
const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(
      "SELECT id_admin, AES_DECRYPT(username, ?) AS username, AES_DECRYPT(email, ?) AS email FROM admin",
      [process.env.SECRET_KEY_MYSQL, process.env.SECRET_KEY_MYSQL]
    );

    // Logs pour déboguer
    console.log("Récupération des administrateurs:", admins);

    // Convertir les Buffers en chaînes de caractères
    const formattedAdmins = admins.map((admin) => ({
      id_admin: admin.id_admin,
      username: admin.username ? admin.username.toString() : null, // Convertir le Buffer en string
      email: admin.email ? admin.email.toString() : null, // Convertir le Buffer en string
    }));

    res.status(200).json(formattedAdmins);
  } catch (error) {
    console.error("Erreur lors de la récupération des administrateurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des administrateurs" });
  }
};

// Créer un nouvel administrateur
const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // Hachage du mot de passe

    // Chiffrement avec MySQL
    const [result] = await db.query(
      "INSERT INTO admin (username, email, password) VALUES (AES_ENCRYPT(?, ?), AES_ENCRYPT(?, ?), ?)",
      [
        username,
        process.env.SECRET_KEY_MYSQL,
        email,
        process.env.SECRET_KEY_MYSQL,
        hashedPassword,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      username,
      email,
      message: "Administrateur créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'administrateur" });
  }
};

// Récupérer un administrateur par ID
const getAdminById = async (req, res) => {
  const adminId = req.params.id;

  try {
    const [admin] = await db.query(
      "SELECT id_admin, AES_DECRYPT(username, ?) AS username, AES_DECRYPT(email, ?) AS email FROM admin WHERE id_admin = ?",
      [process.env.SECRET_KEY_MYSQL, process.env.SECRET_KEY_MYSQL, adminId]
    );

    if (admin.length === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé" });
    }

    // Convertir le Buffer en chaîne de caractères
    const formattedAdmin = {
      id_admin: admin[0].id_admin,
      username: admin[0].username ? admin[0].username.toString() : null, // Convertir le Buffer en string
      email: admin[0].email ? admin[0].email.toString() : null, // Convertir le Buffer en string
    };

    res.json(formattedAdmin);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'administrateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'administrateur" });
  }
};

// Mettre à jour un administrateur
const updateAdmin = async (req, res) => {
  const { id_admin } = req.params;
  const { username, email, password } = req.body;

  // Si aucun champ n'est fourni, renvoyer une erreur
  if (!username && !email && !password) {
    return res.status(400).json({
      message: "Au moins un champ doit être fourni pour la mise à jour.",
    });
  }

  try {
    const updates = [];
    const params = [];

    // Ajouter les mises à jour
    if (username !== undefined) {
      updates.push(`username = AES_ENCRYPT(?, ?)`);
      params.push(username, process.env.SECRET_KEY_MYSQL);
    }
    if (email !== undefined) {
      updates.push(`email = AES_ENCRYPT(?, ?)`);
      params.push(email, process.env.SECRET_KEY_MYSQL);
    }
    if (password !== undefined) {
      updates.push(`password = ?`);
      params.push(await bcrypt.hash(password, SALT_ROUNDS)); // Utilisez le nombre de rounds défini
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Aucune mise à jour effectuée." });
    }

    const query = `UPDATE admin SET ${updates.join(", ")} WHERE id_admin = ?`;
    params.push(id_admin); // Ajouter l'id_admin à la liste des paramètres

    // Exécuter la requête
    const [response] = await db.query(query, params);

    // Vérifier si des lignes ont été affectées
    if (response.affectedRows === 0) {
      return res.status(404).json({ message: "Administrateur non trouvé." });
    }

    res.status(200).json({ message: "Administrateur mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'administrateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'administrateur" });
  }
};

// Supprimer un administrateur
const deleteAdmin = async (req, res) => {
  const { id_admin } = req.params;

  try {
    await db.query("DELETE FROM admin WHERE id_admin = ?", [id_admin]);
    res.json({ message: "Administrateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'administrateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'administrateur" });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminById,
};
