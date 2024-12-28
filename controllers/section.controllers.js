const connection = require("../utils/db_config");

// Créer une nouvelle section
const createSection = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await connection.query(
      "INSERT INTO section (nom_sec) VALUES (?)",
      [name]
    );
    const newSection = {
      id: result.insertId,
      name: name,
    };
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer toutes les sections
const getAllSections = async (req, res) => {
  try {
    const [sections] = await connection.query("SELECT * FROM section");
    const formattedSections = sections.map((section) => ({
      id: section.id_sec,
      name: section.nom_sec,
    }));
    res.status(200).json(formattedSections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une section par ID
const getSectionById = async (req, res) => {
  const { id_sec } = req.params;
  try {
    const [sections] = await connection.query(
      "SELECT * FROM section WHERE id_sec = ?",
      [id_sec]
    );
    if (sections.length === 0) {
      return res.status(404).json({ message: "Section non trouvée" });
    }
    const section = sections[0];
    const formattedSection = {
      id: section.id_sec,
      name: section.nom_sec,
    };
    res.status(200).json(formattedSection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une section
const updateSection = async (req, res) => {
  const { id_sec } = req.params;
  const { name } = req.body;
  try {
    const [result] = await connection.query(
      "UPDATE section SET nom_sec = ? WHERE id_sec = ?",
      [name, id_sec]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Section non trouvée" });
    }
    res
      .status(200)
      .json({ message: "Section mise à jour", id: id_sec, name: name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une section
const deleteSection = async (req, res) => {
  const { id_sec } = req.params;
  try {
    const [result] = await connection.query(
      "DELETE FROM section WHERE id_sec = ?",
      [id_sec]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Section non trouvée" });
    }
    res.status(200).json({ message: "Section supprimée", id: id_sec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
};
