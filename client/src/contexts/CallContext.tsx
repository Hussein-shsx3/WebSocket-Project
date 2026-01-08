// client/src/contexts/CallContext.tsx

"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { socketClient } from "@/socket/client";
import type { ConversationUser } from "@/services/conversations.service";
import type { CallOfferData, CallAnswerData, CallIceCandidateData } from "@/types/socket.types";

type CallStatus = "INITIATING" | "RINGING" | "ACTIVE" | "ENDED" | "DECLINED" | "MISSED" | "CANCELED";
type CallType = "AUDIO" | "VIDEO";

interface CallState {
  isInCall: boolean;
  callType: CallType;
  callStatus: CallStatus;
  isIncoming: boolean;
  conversationId: string | null;
  user: ConversationUser | null;
  offer: RTCSessionDescriptionInit | null;
}

interface CallContextType {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (conversationId: string, user: ConversationUser, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
}

const initialCallState: CallState = {
  isInCall: false,
  callType: "AUDIO",
  callStatus: "ENDED",
  isIncoming: false,
  conversationId: null,
  user: null,
  offer: null,
};

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const CallContext = createContext<CallContextType | undefined>(undefined);

interface CallProviderProps {
  children: ReactNode;
}

export const CallProvider = ({ children }: CallProviderProps) => {
  const [callState, setCallState] = useState<CallState>(initialCallState);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Get user media
  const getUserMedia = useCallback(async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720, facingMode: "user" } : false,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((receiverId: string, conversationId?: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = socketClient.getSocket();
        socket?.emit("call:ice-candidate", {
          conversationId,
          candidate: event.candidate,
          to: receiverId,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received");
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallState((prev) => ({ ...prev, callStatus: "ACTIVE" }));
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // Cleanup call resources
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  // Start an outgoing call
  const startCall = useCallback(async (conversationId: string, user: ConversationUser, type: CallType) => {
    setCallState({
      isInCall: true,
      callType: type,
      callStatus: "INITIATING",
      isIncoming: false,
      conversationId,
      user,
      offer: null,
    });

    try {
      const stream = await getUserMedia(type === "VIDEO");
      if (!stream) return;

      const pc = createPeerConnection(user.id, conversationId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = socketClient.getSocket();
      socket?.emit("call:offer", {
        conversationId,
        offer,
        to: user.id,
        callType: type,
      });

      setCallState((prev) => ({ ...prev, callStatus: "RINGING" }));
    } catch (error) {
      console.error("Error starting call:", error);
      cleanup();
      setCallState(initialCallState);
    }
  }, [getUserMedia, createPeerConnection, cleanup]);

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    if (!callState.offer || !callState.user || !callState.conversationId) return;

    try {
      const stream = await getUserMedia(callState.callType === "VIDEO");
      if (!stream) return;

      const pc = createPeerConnection(callState.user.id, callState.conversationId || undefined);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(callState.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = socketClient.getSocket();
      socket?.emit("call:answer", {
        conversationId: callState.conversationId,
        answer,
        to: callState.user.id,
      });

      setCallState((prev) => ({ ...prev, callStatus: "ACTIVE" }));
    } catch (error) {
      console.error("Error accepting call:", error);
      cleanup();
      setCallState(initialCallState);
    }
  }, [callState.offer, callState.user, callState.callType, callState.conversationId, getUserMedia, createPeerConnection, cleanup]);

  // Decline an incoming call
  const declineCall = useCallback(() => {
    if (!callState.conversationId || !callState.user?.id) return;
    const socket = socketClient.getSocket();
    socket?.emit("call:decline", {
      conversationId: callState.conversationId,
      to: callState.user.id,
    });
    cleanup();
    setCallState(initialCallState);
  }, [callState.conversationId, callState.user?.id, cleanup]);

  // End an active call
  const endCall = useCallback(() => {
    if (!callState.conversationId || !callState.user?.id) return;
    const socket = socketClient.getSocket();
    socket?.emit("call:end", {
      conversationId: callState.conversationId,
      to: callState.user.id,
    });
    cleanup();
    setCallState(initialCallState);
  }, [callState.conversationId, callState.user?.id, cleanup]);

  // Listen for socket events
  useEffect(() => {
    const socket = socketClient.getSocket();
    if (!socket) return;

    // Incoming call
    socket.on("call:offer", (data: CallOfferData) => {
      console.log("Incoming call from:", data.from);
      setCallState({
        isInCall: true,
        callType: data.callType,
        callStatus: "RINGING",
        isIncoming: true,
        conversationId: data.conversationId,
        user: data.user as ConversationUser,
        offer: data.offer,
      });
    });

    // Call answered
    socket.on("call:answer", async (data: CallAnswerData) => {
      console.log("Call answered");
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallState((prev) => ({ ...prev, callStatus: "ACTIVE" }));
      }
    });

    // Call declined
    socket.on("call:declined", () => {
      console.log("Call declined");
      cleanup();
      setCallState((prev) => ({ ...prev, callStatus: "DECLINED" }));
      setTimeout(() => setCallState(initialCallState), 2000);
    });

    // Call ended
    socket.on("call:ended", () => {
      console.log("Call ended");
      cleanup();
      setCallState((prev) => ({ ...prev, callStatus: "ENDED" }));
      setTimeout(() => setCallState(initialCallState), 2000);
    });

    // ICE candidate
    socket.on("call:ice-candidate", async (data: CallIceCandidateData) => {
      const pc = peerConnectionRef.current;
      if (pc && data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:declined");
      socket.off("call:ended");
      socket.off("call:ice-candidate");
    };
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <CallContext.Provider
      value={{
        callState,
        localStream,
        remoteStream,
        startCall,
        acceptCall,
        declineCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};
