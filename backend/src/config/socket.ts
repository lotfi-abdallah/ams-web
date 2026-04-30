import type { RequestHandler } from "express";
import type { Session, SessionData } from "express-session";
import type { IncomingMessage } from "http";
import type { Server as HttpsServer } from "https";
import { Server, Socket } from "socket.io";
import { env } from "./env";

let io: Server;

type SessionRequest = IncomingMessage & {
  session?: Session & Partial<SessionData>;
};

const wrapSessionMiddleware =
  (middleware: RequestHandler) =>
  (socket: Socket, next: (err?: Error) => void) =>
    middleware(socket.request as any, {} as any, next as any);

const socketCorsOrigins = Array.from(
  new Set([
    `http://${env.host}:${env.frontendPort}`,
    `https://${env.host}:${env.frontendPort}`,
    `http://${env.host}:${env.httpPort}`,
    `https://${env.host}:${env.httpsPort}`,
  ]),
);

export function initSocket(
  server: HttpsServer,
  sessionMiddleware: RequestHandler,
) {
  io = new Server(server, {
    cors: {
      origin: socketCorsOrigins,
      credentials: true,
    },
  });

  io.use(wrapSessionMiddleware(sessionMiddleware));

  io.use((socket, next) => {
    const request = socket.request as SessionRequest;

    if (!request.session?.user) {
      return next(new Error("Unauthorized socket connection"));
    }

    socket.data.user = request.session.user;
    return next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });
}

export function getSocket() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
