import { app } from "./app";
import { env } from "./src/config/env";

app.listen(env.port, () => {
  console.log(`Serveur démarré sur le port ${env.port}`);
});
