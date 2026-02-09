import { app } from "./app";
import { env } from "./src/config/env";
import https from "https";
import fs from "fs";
import { connectDB } from "./src/config/postgres";

// Connect to the database before starting the server
connectDB();

// HTTPS server setup (optional, for secure connections)
const httpsOptions = {
  key: fs.readFileSync("cert/private.key"),
  cert: fs.readFileSync("cert/certificate.crt"),
};

// HTTPS
https.createServer(httpsOptions, app).listen(env.httpsPort, () => {
  console.log(
    `Serveur HTTPS démarré sur le port https://${env.host}:${env.httpsPort}`,
  );
});

// HTTP
app.listen(env.httpPort, () => {
  console.log(`Serveur démarré sur le port http://${env.host}:${env.httpPort}`);
});
