import { app } from "./app";
import { env } from "./src/config/env";
import https from "https";
import fs from "fs";

// HTTPS server setup (optional, for secure connections)
const httpsOptions = {
  key: fs.readFileSync("cert/private.key"),
  cert: fs.readFileSync("cert/certificate.crt"),
};
https.createServer(httpsOptions, app).listen(env.httpsPort, () => {
  console.log(
    `Serveur HTTPS démarré sur le port https://${env.host}:${env.httpsPort}`,
  );
});

// HTTP server setup (default)

app.listen(env.httpPort, () => {
  console.log(`Serveur démarré sur le port http://${env.host}:${env.httpPort}`);
});
