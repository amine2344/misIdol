//--- MODULES
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const connection = require("./utils/db_config");
dotenv.config();
const https = require("https");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const fs = require("fs");

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
const imagesRoute = require("./routes/images.routes.js");
const clientRoutes = require("./routes/client.routes.js");
const shipmentsRoutes = require("./routes/shipements.routes.js");

// require("./utils/task_schudel");
//app.use("/api", shipmentsRoutesddxcdd);

// bodyparser middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//--- MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://missidol.art",
  "https://admin.missidol.art",
  "http://missidol.art", "https://www.missidol.art"
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Allow internal requests (i.e., no origin)
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow HTTP methods
  credentials: true, // Allow cookies
  allowedHeaders: ["Content-Type", "Authorization"], // Allow headers
};

const options = {
    key: fs.readFileSync("/etc/ssl/private/private.key"),
    cert: fs.readFileSync("/etc/ssl/certificate.crt"),
};
app.use(cors(corsOptions));

// Helmet for security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'"],
      },
    },
    frameguard: { action: "deny" }, // Prevent iframe display
    hsts: {
      maxAge: 31536000, // Force HTTPS for 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
);

//--- ROUTES
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
app.use("/api", imagesRoute);
app.use("/api", clientRoutes);
app.use("/api", shipmentsRoutes);
//--- EXPRESS SERVER RUNNING
const port = 3000;
app.listen(port, () => {
  console.log("Server is listening on PORT " + port);
});
const port2 = 3001;
https.createServer(options, app).listen(port2, () => {
    console.log(`HTTPS Server is listening on PORT ${port2}`);
});
