// client/src/hooks/useWebRTC.ts

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { socketClient } from "@/socket/client";

interface UseWebRTCProps {
  conversationId: string;
  receiverId: string;
}

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = ({ conversationId, receiverId }: UseWebRTCProps) => {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    isConnecting: false,
    isConnected: false,
    error: null,
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Get user media (camera/microphone)
  const getUserMedia = useCallback(async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720, facingMode: "user" } : false,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setState((prev) => ({ ...prev, localStream: stream }));
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      setState((prev) => ({ ...prev, error: "Could not access camera/microphone" }));
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = socketClient.getSocket();
        socket?.emit("call:ice-candidate", {
          candidate: event.candidate,
          to: receiverId,
        });
      }
    };

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setState((prev) => ({ ...prev, remoteStream: event.streams[0] }));
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setState((prev) => ({ ...prev, isConnected: true, isConnecting: false }));
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setState((prev) => ({ ...prev, isConnected: false, isConnecting: false }));
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [conversationId, receiverId]);

  // Start outgoing call
  const startCall = useCallback(async (video: boolean = true) => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const stream = await getUserMedia(video);
      if (!stream) return;

      const pc = createPeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer through socket
      const socket = socketClient.getSocket();
      socket?.emit("call:offer", {
        conversationId,
        offer,
        to: receiverId,
        callType: video ? "VIDEO" : "AUDIO",
      });

      console.log("Offer sent to:", receiverId);
    } catch (error) {
      console.error("Error starting call:", error);
      setState((prev) => ({ ...prev, error: "Failed to start call", isConnecting: false }));
    }
  }, [getUserMedia, createPeerConnection, conversationId, receiverId]);

  // Answer incoming call
  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit, video: boolean = true) => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const stream = await getUserMedia(video);
      if (!stream) return;

      const pc = createPeerConnection();

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer through socket
      const socket = socketClient.getSocket();
      socket?.emit("call:answer", {
        conversationId,
        answer,
        to: receiverId,
      });

      console.log("Answer sent to:", receiverId);
    } catch (error) {
      console.error("Error answering call:", error);
      setState((prev) => ({ ...prev, error: "Failed to answer call", isConnecting: false }));
    }
  }, [getUserMedia, createPeerConnection, conversationId, receiverId]);

  // Handle incoming answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionRef.current;
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Remote description set");
    }
  }, []);

  // Handle incoming ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionRef.current;
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added");
    }
  }, []);

  // End call
  const endCall = useCallback(() => {
    // Stop local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Notify other user
    const socket = socketClient.getSocket();
    socket?.emit("call:end", {
      conversationId,
      to: receiverId,
    });

    // Reset state
    setState({
      localStream: null,
      remoteStream: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    });
  }, [conversationId, receiverId]);

  // Setup socket listeners
  useEffect(() => {
    const socket = socketClient.getSocket();
    if (!socket) return;

    socket.on("call:answer", (data) => {
      handleAnswer(data.answer);
    });

    socket.on("call:ice-candidate", (data) => {
      handleIceCandidate(data.candidate);
    });

    socket.on("call:ended", () => {
      endCall();
    });

    return () => {
      socket.off("call:answer");
      socket.off("call:ice-candidate");
      socket.off("call:ended");
    };
  }, [handleAnswer, handleIceCandidate, endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    ...state,
    startCall,
    answerCall,
    endCall,
    handleAnswer,
    handleIceCandidate,
  };
};
