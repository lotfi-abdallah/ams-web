import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  httpPort: Number(process.env.HTTP_PORT) || 3188,
  httpsPort: Number(process.env.HTTPS_PORT) || 3189,
  host: process.env.HOST || "localhost",
  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || "admin",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "mydb",
  },
};
