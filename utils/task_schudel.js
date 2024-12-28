const cron = require("node-cron");
const pool = require("../utils/db_config");

// Suppression des sessions inactives depuis plus de 2 heures ou automatiquement après 24 heures
cron.schedule("*/30 * * * *", () => {
  const now = new Date();
  const twoHoursAgo = new Date(now - 2 * 3600000); // 2 heures
  const twentyFourHoursAgo = new Date(now - 24 * 3600000); // 24 heures

  // Suppression des sessions inactives depuis plus de 2 heures
  const sqlInactive = "DELETE FROM session WHERE last_activity < ?";
  pool.query(sqlInactive, [twoHoursAgo], (err) => {
    if (err) {
      console.error(
        "Erreur lors de la suppression des sessions inactives:",
        err
      );
    }
    console.log(
      "Sessions inactives depuis plus de 2 heures supprimées avec succès."
    );
  });

  // Suppression automatique des sessions après 24 heures
  const sqlAutoDelete = "DELETE FROM session WHERE created_at < ?";
  pool.query(sqlAutoDelete, [twentyFourHoursAgo], (err) => {
    if (err) {
      console.error(
        "Erreur lors de la suppression automatique des sessions après 24 heures:",
        err
      );
    }
    console.log(
      "Sessions supprimées automatiquement après 24 heures avec succès."
    );
  });
});
