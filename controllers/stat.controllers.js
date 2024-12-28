const connection = require("../utils/db_config"); // Assure-toi que ce chemin correspond à la configuration de ta base de données

// Contrôleur pour obtenir le nombre de messages reçus par mois
exports.getMessagesByMonth = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `
      SELECT 
        YEAR(created_at) AS year,
        MONTH(created_at) AS month,
        COUNT(*) AS message_count
      FROM 
        message
      GROUP BY 
        YEAR(created_at),
        MONTH(created_at)
      ORDER BY 
        year DESC,
        month DESC
      `
    );

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Contrôleur pour obtenir les pays avec le plus d'interactions
exports.getCountriesInteractions = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `
      SELECT 
        co.iso AS country_id ,
        co.name AS country_name,
        COUNT(*) AS message_count
      FROM 
        message m
      JOIN 
        client c ON m.client_id = c.id_client
      JOIN 
        country co ON c.id_pays = co.id
      GROUP BY 
        co.name
      ORDER BY 
        message_count DESC
      `
    );

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Contrôleur pour obtenir le nombre de clients par réseau social
exports.getClientsByReconnaissance = async (req, res) => {
  try {
    const [rows] = await connection.promise().query(
      `
      SELECT 
        reconnu AS recognition_source,
        COUNT(*) AS total_clients
      FROM 
        client
      GROUP BY 
        reconnu
      ORDER BY 
        total_clients DESC
      `
    );

    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
