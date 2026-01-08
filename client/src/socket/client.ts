import { io } from "socket.io-client";
import type { TypedSocket, SocketState } from "@/types/socket.types";

class SocketClient {
  private socket: TypedSocket | null = null;
  private state: SocketState = {
    status: "disconnected",
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  };
  private listeners = new Set<(state: SocketState) => void>();

  /**
   * Create and connect socket
   */
  create(token: string): TypedSocket {
    // If already connected, return existing socket
    if (this.socket?.connected) {
      return this.socket;
    }

    // Get API URL - Socket.IO connects to the root, not a path
    // If API_URL includes /api, we need to remove it for socket connection
    const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    // Socket.IO connects to the server root, not /api path
    const socketUrl = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

    // Create new socket instance
    this.socket = io(socketUrl, {
      auth: { token }, // Send JWT token in auth object
      // Allow engine.io to pick the initial transport (polling -> upgrade to websocket)
      // This avoids forcing a direct websocket handshake which can fail in some dev setups.
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    }) as TypedSocket;

    this.setupConnectionHandlers();
    return this.socket;
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers() {
    if (!this.socket) return;

    // ✅ Connected successfully
    this.socket.on("connect", () => {
      // socket connected (log removed)
      this.updateState({
        status: "connected",
        error: null,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      });
    });

    // ❌ Disconnected
    this.socket.on("disconnect", (reason) => {
      // socket disconnected (log removed)
      this.updateState({
        status:
          reason === "io server disconnect" ? "disconnected" : "reconnecting",
        error: reason,
      });
    });

    // ⚠️ Connection error
    this.socket.on("connect_error", (error) => {
      // Log full error for easier debugging (includes stack and properties)
      console.error("❌ Socket connection error:", error);
      this.updateState({
        status: "error",
        error: error.message,
        reconnectAttempts: this.state.reconnectAttempts + 1,
      });
    });

    // 🔄 Reconnecting
    this.socket.io.on("reconnect_attempt", (attempt) => {
      // reconnection attempt (log removed)
      this.updateState({
        status: "reconnecting",
        reconnectAttempts: attempt,
      });
    });

    // ❌ Reconnection failed
    this.socket.io.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after maximum attempts");
      this.updateState({
        status: "error",
        error: "Failed to reconnect after maximum attempts",
      });
    });

    // ✅ Reconnected successfully
    this.socket.io.on("reconnect", () => {
      // reconnected (log removed)
      this.updateState({
        status: "connected",
        error: null,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      });
    });
  }

  /**
   * Update state and notify listeners
   */
  private updateState(partial: Partial<SocketState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  /**
   * Notify all state listeners
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Subscribe to state changes (for React hooks)
   */
  subscribe(listener: (state: SocketState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state); // Send current state immediately
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current socket instance
   */
  getSocket(): TypedSocket | null {
    return this.socket;
  }

  /**
   * Get current connection state
   */
  getState(): SocketState {
    return this.state;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Manually disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Destroy socket and cleanup
   */
  destroy() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.updateState({
      status: "disconnected",
      error: null,
      reconnectAttempts: 0,
    });
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
