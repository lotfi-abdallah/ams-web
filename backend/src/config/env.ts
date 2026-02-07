import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  httpPort: Number(process.env.HTTP_PORT) || 3188,
  httpsPort: Number(process.env.HTTPS_PORT) || 3189,
  host: process.env.HOST || "localhost",
};
