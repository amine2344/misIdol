// Middleware pour la validation du contenu du fichier
const validateImageContent = (req, res, next) => {
    if (!req.file) return next();

    const filePath = path.join(__dirname, 'uploads/photos', req.file.filename);

    sizeOf(filePath, (err, dimensions) => {
        if (err) {
            return res.status(400).send('Erreur lors de la lecture des dimensions de l\'image');
        }

        // Validez les dimensions, par exemple, en limitant la taille maximale de l'image
        if (dimensions.width > 1920 || dimensions.height > 1080) {
            return res.status(400).send('Dimensions de l\'image non valides');
        }

        next();
    });
};



module.exports = validateImageContent 