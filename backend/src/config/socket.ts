import type { Server as HttpsServer } from "https";
import { Server } from "socket.io";

let io: Server;

export function initSocket(server: HttpsServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
}

export function getSocket() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
