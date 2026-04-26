import { env } from "./env";
import { createMongoSessionStore, session } from "./mongodb";

const store = createMongoSessionStore();

export const sessionMiddleware = session({
  secret: env.mongodb.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    secure: env.nodeEnv === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // 1 hour
  },
});
