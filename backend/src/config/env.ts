import dotenv from "dotenv";

dotenv.config();

/**
 * Configuration des variables d'environnement pour l'application.
 * Les valeurs par défaut sont fournies.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  httpPort: Number(process.env.HTTP_PORT) || 3188,
  httpsPort: Number(process.env.HTTPS_PORT) || 3189,
  host: process.env.HOST || "localhost",
  frontendPort: Number(process.env.FRONTEND_PORT) || 4200,
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || "admin",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "mydb",
  },
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    database: process.env.MONGODB_DB || "db-CERI",
    sessionSecret: process.env.MONGODB_SESSION_SECRET || "hello-world",
  },
};
