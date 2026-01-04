// client/src/components/ui/call/CallUI.tsx

"use client";

import { useCall } from "@/contexts/CallContext";
import { CallModal } from "./CallModal";

/**
 * Global Call UI Component
 * Renders the call modal when there's an active call
 * Should be placed at the root of the app
 */
export const CallUI = () => {
  const {
    callState,
    localStream,
    remoteStream,
    acceptCall,
    declineCall,
    endCall,
  } = useCall();

  if (!callState.isInCall || !callState.user) {
    return null;
  }

  return (
    <CallModal
      isOpen={callState.isInCall}
      onClose={endCall}
      callType={callState.callType}
      user={callState.user}
      isIncoming={callState.isIncoming}
      onAccept={acceptCall}
      onDecline={declineCall}
      localStream={localStream}
      remoteStream={remoteStream}
      callStatus={callState.callStatus}
    />
  );
};
