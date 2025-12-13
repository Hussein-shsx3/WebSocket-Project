import prisma from "../config/db";
import { CallType, CallStatus } from "@prisma/client";
import {
  NotFoundError,
  BadRequestError,
  AuthorizationError,
} from "../types/error.types";

export class CallService {
  /**
   * Initiate a call
   */
  async initiateCall(
    conversationId: string,
    callerId: string,
    receiverId: string,
    callType: "AUDIO" | "VIDEO"
  ) {
    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    // Check if both users are in the conversation
    const callerParticipant = conversation.participants.find(
      (p) => p.userId === callerId
    );
    const receiverParticipant = conversation.participants.find(
      (p) => p.userId === receiverId
    );

    if (!callerParticipant || !receiverParticipant) {
      throw new AuthorizationError("Both users must be in the conversation");
    }

    // Check if there's already an active call
    const activeCall = await prisma.call.findFirst({
      where: {
        conversationId,
        status: {
          in: ["INITIATING", "RINGING", "ACTIVE"],
        },
      },
    });

    if (activeCall) {
      throw new BadRequestError("There is already an active call in this conversation");
    }

    // Create new call
    const call = await prisma.call.create({
      data: {
        conversationId,
        callerId,
        receiverId,
        type: callType as CallType,
        status: "INITIATING" as CallStatus,
        startedAt: new Date(),
      },
    });

    return call;
  }

  /**
   * Update call status
   */
  async updateCallStatus(callId: string, status: CallStatus) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundError("Call not found");
    }

    // Validate state transitions
    const validTransitions: Record<CallStatus, CallStatus[]> = {
      INITIATING: ["RINGING", "CANCELED"],
      RINGING: ["ACTIVE", "DECLINED", "MISSED"],
      ACTIVE: ["ENDED"],
      ENDED: [],
      DECLINED: [],
      MISSED: [],
      CANCELED: [],
    };

    if (!validTransitions[call.status].includes(status)) {
      throw new BadRequestError(
        `Cannot transition from ${call.status} to ${status}`
      );
    }

    const updateData: any = {
      status,
    };

    if (status === "ACTIVE") {
      updateData.startedAt = new Date();
    } else if (status === "ENDED") {
      updateData.endedAt = new Date();
      if (call.startedAt) {
        const duration = Math.floor(
          (new Date().getTime() - call.startedAt.getTime()) / 1000
        );
        updateData.duration = duration;
      }
    }

    const updated = await prisma.call.update({
      where: { id: callId },
      data: updateData,
    });

    return updated;
  }

  /**
   * End a call
   */
  async endCall(callId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundError("Call not found");
    }

    const endedAt = new Date();
    let duration = 0;

    if (call.startedAt) {
      duration = Math.floor(
        (endedAt.getTime() - call.startedAt.getTime()) / 1000
      );
    }

    const updated = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "ENDED" as CallStatus,
        endedAt,
        duration,
      },
    });

    return updated;
  }

  /**
   * Decline a call
   */
  async declineCall(callId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundError("Call not found");
    }

    if (call.status !== "RINGING") {
      throw new BadRequestError("Can only decline a ringing call");
    }

    const updated = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "DECLINED" as CallStatus,
        endedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Mark a call as missed
   */
  async missCall(callId: string) {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundError("Call not found");
    }

    if (!["INITIATING", "RINGING"].includes(call.status)) {
      throw new BadRequestError("Call must be ringing to mark as missed");
    }

    const updated = await prisma.call.update({
      where: { id: callId },
      data: {
        status: "MISSED" as CallStatus,
        endedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Get active call in a conversation
   */
  async getActiveCall(conversationId: string) {
    const call = await prisma.call.findFirst({
      where: {
        conversationId,
        status: {
          in: ["INITIATING", "RINGING", "ACTIVE"],
        },
      },
    });

    return call || null;
  }

  /**
   * Get call history
   */
  async getCallHistory(
    conversationId: string,
    userId: string,
    limit: number = 20,
    skip: number = 0
  ) {
    // Check if user is in the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new AuthorizationError("You are not a member of this conversation");
    }

    const calls = await prisma.call.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        startedAt: "desc",
      },
      take: limit,
      skip,
    });

    return calls;
  }
}

// Export singleton instance
export const callService = new CallService();
