import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  user: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log any errors emitted by the pool to help with debugging connection issues
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client", err);
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connection pool established");
    client.release();
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
};
