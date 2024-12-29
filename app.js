//--- MODULES

const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connection = require("./utils/db_config");
dotenv.config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

//--- ROUTES

const authRoutes = require("./routes/auth.routes");
const statsRoutes = require("./routes/stat.routes");
const adminRoutes = require("./routes/admin.routes");
const sectionRoutes = require("./routes/section.routes");
const categorieRoutes = require("./routes/categorie.routes");
const sousCategorieRoutes = require("./routes/sous_categorie.routes");
const collectionRoutes = require("./routes/collection.routes");
const styleRoutes = require("./routes/style.routes");
const materielRoutes = require("./routes/materiel.routes");
const typeTailleRoutes = require("./routes/type_taille.routes");
const tailleRoutes = require("./routes/tailles.routes");
const produitRoutes = require("./routes/produit.routes");
const couleurRoutes = require("./routes/couleur.routes");
const commandeRoutes = require("./routes/commande.routes");
const materielProduitRoutes = require("./routes/materiel_produit.routes");
const produitCommandeRoutes = require("./routes/produit_commande.routes");
const produitTailleRoutes = require("./routes/produit_taille.routes");
const produitCouleurPhotoRoutes = require("./routes/produit_couleur_photo.routes");
const photoRoutes = require("./routes/photo.routes");
//const mollieRoute = require("./routes/purchase.routes");
const dropdownRoutes = require("./client/dropdown.routes");
const qteProdRoutes = require("./routes/qteProduit.routes");
const produitTailleCouleurQuantiteRoutes = require("./routes/produitTailleCouleurQuantite.routes");
const livraisonRoutes = require("./routes/livraison.routes");
const novaPostRoutes = require("./client/delivery.routes.js");

// require("./utils/task_schudel");

//--- MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];
// Fonction pour vérifier si l'origine est autorisée
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Si l'origine est dans la liste ou si elle est absente (requête interne, par exemple)
      callback(null, true);
    } else {
      // Si l'origine n'est pas autorisée
      callback(new Error("CORS non autorisé"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Autoriser les méthodes HTTP
  credentials: true, // Permettre l'envoi de cookies
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'"],
      },
    },
    frameguard: { action: "deny" }, // Empêcher l'affichage dans un iframe
    hsts: {
      maxAge: 31536000, // Force HTTPS pendant 1 an
      includeSubDomains: true,
      preload: true,
    },
  })
);

//--- ROUTES

app.use(
  "/api/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);
app.use("/api", adminRoutes);
app.use("/api", authRoutes);
app.use("/api", sectionRoutes);
app.use("/api", categorieRoutes);
app.use("/api", sousCategorieRoutes);
app.use("/api", collectionRoutes);
app.use("/api", styleRoutes);
app.use("/api", materielRoutes);
app.use("/api", typeTailleRoutes);
app.use("/api", tailleRoutes);
app.use("/api", produitRoutes);
app.use("/api", photoRoutes);
app.use("/api", couleurRoutes);
app.use("/api", commandeRoutes);
app.use("/api", materielProduitRoutes);
app.use("/api", produitCommandeRoutes);
app.use("/api", produitCouleurPhotoRoutes);
app.use("/api", produitTailleRoutes);
app.use("/api/stats", statsRoutes);
//app.use("/api", mollieRoute);
app.use("/api", dropdownRoutes);
app.use("/api", qteProdRoutes);
app.use("/api", produitTailleCouleurQuantiteRoutes);
app.use("/api", livraisonRoutes);
app.use("/api", novaPostRoutes);

//--- RELATIONNAL DB CONNEXION

//--- EXPRESS SERVER RUNNING

const port = 3000;
app.listen(port, () => {
  console.log("Server is listenning PORT " + port);
});
