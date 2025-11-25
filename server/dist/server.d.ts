import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export declare const io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { server, prisma };
//# sourceMappingURL=server.d.ts.map