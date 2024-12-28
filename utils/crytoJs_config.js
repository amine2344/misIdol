const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = process.env.ENCRYPTION_KEY; // Utiliser une clé secrète
if (Buffer.from(SECRET_KEY, "hex").length !== 32) {
  throw new Error(
    "La clé de chiffrement doit avoir une longueur de 32 octets."
  );
}
const IV_LENGTH = 16; // Taille de l'IV pour AES

// Fonction pour chiffrer le texte
const encrypt = (text) => {
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY, "hex"),
      iv
    );
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Erreur lors du chiffrement:", error);
    throw new Error("Chiffrement échoué.");
  }
};

const decrypt = (text) => {
  try {
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(SECRET_KEY, "hex"),
      iv
    );
    let decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    return decrypted.toString();
  } catch (error) {
    console.error("Erreur lors du déchiffrement:", error);
    throw new Error("Déchiffrement échoué.");
  }
};

module.exports = { encrypt, decrypt };
