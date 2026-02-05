/**
 * Socket Module Exports
 * 
 * This file exports all socket-related utilities:
 * - socketService: Singleton for raw socket operations
 * - SocketProvider: React context provider
 * - useSocket: Hook to access socket context
 */

export { socketService } from "./socket.service";
export { SocketProvider, useSocket } from "./SocketContext";
