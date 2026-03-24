const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
import mongoose from "mongoose";
import { env } from "./env";

export async function connectMongoDB() {
  try {
    const uri = env.mongodb.uri.endsWith("/")
      ? env.mongodb.uri
      : `${env.mongodb.uri}/`;
    await mongoose.connect(`${uri}${env.mongodb.database}`);
    console.log("✅ MongoDB connected successfully through Mongoose");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export function createMongoSessionStore() {
  const store = new MongoDBStore({
    uri: env.mongodb.uri,
    databaseName: env.mongodb.database,
    collection: "MySession3188",
  });

  store.on("connected", () => {
    console.log("✅ MongoDB Session Store connected successfully");
  });

  store.on("disconnected", () => {
    console.log("❌ MongoDB Session Store disconnected");
  });

  store.on("error", (error: Error) => {
    console.error("❌ MongoDB Session Store connection error:", error);
  });

  return store;
}

export { session };
