// client/src/components/ui/call/CallModal.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from "lucide-react";
import { UserAvatar } from "../display/UserAvatar";
import type { ConversationUser } from "@/services/conversations.service";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "AUDIO" | "VIDEO";
  user: ConversationUser;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  callStatus: "INITIATING" | "RINGING" | "ACTIVE" | "ENDED" | "DECLINED" | "MISSED" | "CANCELED";
}

/**
 * Call Modal Component
 * Modern, sleek design for video/voice calls
 */
export const CallModal = ({
  isOpen,
  onClose,
  callType,
  user,
  isIncoming = false,
  onAccept,
  onDecline,
  localStream,
  remoteStream,
  callStatus,
}: CallModalProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "ACTIVE") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative bg-header rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-lg mx-4'
      }`}>
        
        {/* Video Display for Video Calls */}
        {callType === "VIDEO" && callStatus === "ACTIVE" ? (
          <div className="relative aspect-video bg-black">
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-header flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-secondary" />
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-xl transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Call Duration */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 rounded-full">
              <span className="text-sm font-medium text-white">{formatDuration(callDuration)}</span>
            </div>
          </div>
        ) : (
          /* Voice Call / Waiting Screen */
          <div className="p-8 text-center">
            {/* User Avatar */}
            <div className="relative inline-block mb-6">
              <div className={`${callStatus === "RINGING" || callStatus === "INITIATING" ? 'animate-pulse' : ''}`}>
                <UserAvatar user={user} size="lg" showStatus={false} />
              </div>
              {(callStatus === "RINGING" || callStatus === "INITIATING") && (
                <div className="absolute inset-0 rounded-full border-4 border-primaryColor/30 animate-ping" />
              )}
            </div>

            {/* User Name */}
            <h2 className="text-xl font-bold text-primary mb-2">
              {user.name || user.email}
            </h2>

            {/* Call Status */}
            <p className="text-sm text-secondary mb-8">
              {callStatus === "INITIATING" && "Calling..."}
              {callStatus === "RINGING" && (isIncoming ? "Incoming call..." : "Ringing...")}
              {callStatus === "ACTIVE" && (
                <span className="text-success-500 font-medium">
                  {callType === "AUDIO" ? formatDuration(callDuration) : "Connected"}
                </span>
              )}
              {callStatus === "ENDED" && "Call ended"}
              {callStatus === "DECLINED" && "Call declined"}
              {callStatus === "MISSED" && "Missed call"}
              {callStatus === "CANCELED" && "Call canceled"}
            </p>

            {/* Call Type Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-primaryColor/10 rounded-2xl flex items-center justify-center">
                {callType === "VIDEO" ? (
                  <Video className="w-8 h-8 text-primaryColor" />
                ) : (
                  <Phone className="w-8 h-8 text-primaryColor" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Incoming Call Controls */}
            {isIncoming && (callStatus === "RINGING" || callStatus === "INITIATING") ? (
              <>
                {/* Decline Button */}
                <button
                  onClick={onDecline}
                  className="w-16 h-16 bg-error-500 hover:bg-error-600 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
                  title="Decline call"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>

                {/* Accept Button */}
                <button
                  onClick={onAccept}
                  className="w-16 h-16 bg-success-500 hover:bg-success-600 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg animate-pulse"
                  title="Accept call"
                >
                  {callType === "VIDEO" ? (
                    <Video className="w-7 h-7 text-white" />
                  ) : (
                    <Phone className="w-7 h-7 text-white" />
                  )}
                </button>
              </>
            ) : callStatus === "ACTIVE" ? (
              /* Active Call Controls */
              <>
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                    isMuted ? 'bg-error-500 hover:bg-error-600' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>

                {/* Video Toggle (for video calls) */}
                {callType === "VIDEO" && (
                  <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                      isVideoOff ? 'bg-error-500 hover:bg-error-600' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {isVideoOff ? (
                      <VideoOff className="w-6 h-6 text-white" />
                    ) : (
                      <Video className="w-6 h-6 text-white" />
                    )}
                  </button>
                )}

                {/* End Call Button */}
                <button
                  onClick={onClose}
                  className="w-16 h-16 bg-error-500 hover:bg-error-600 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
                  title="End call"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
              </>
            ) : (callStatus === "INITIATING" || callStatus === "RINGING") && !isIncoming ? (
              /* Outgoing Call - Cancel Button */
              <button
                onClick={onClose}
                className="w-16 h-16 bg-error-500 hover:bg-error-600 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
                title="Cancel call"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
            ) : (
              /* Call Ended - Close Button */
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all duration-200"
                title="Close"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
