import { app } from "./app";
import { env } from "./config/env";
import https from "https";
import fs from "fs";
import { connectDB } from "./config/postgres";
import { connectMongoDB } from "./config/mongodb";

// Connect to the database before starting the server
connectDB();
connectMongoDB();

/**
 * Les options pour le serveur HTTPS, incluant la clé privée et le certificat.
 */
const httpsOptions = {
  key: fs.readFileSync("cert/private.key"),
  cert: fs.readFileSync("cert/certificate.crt"),
};

/**
 * Démarrage du serveur HTTPS sur le port spécifié dans les variables d'environnement.
 */
https.createServer(httpsOptions, app).listen(env.httpsPort, () => {
  console.log(
    `Serveur HTTPS démarré sur le port https://${env.host}:${env.httpsPort}`,
  );
});

/**
 * Démarrage du serveur HTTP sur le port spécifié dans les variables d'environnement.
 */
app.listen(env.httpPort, () => {
  console.log(`Serveur démarré sur le port http://${env.host}:${env.httpPort}`);
});
