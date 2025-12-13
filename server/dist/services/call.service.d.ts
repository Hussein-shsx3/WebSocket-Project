import { CallStatus } from "@prisma/client";
export declare class CallService {
    initiateCall(conversationId: string, callerId: string, receiverId: string, callType: "AUDIO" | "VIDEO"): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    }>;
    updateCallStatus(callId: string, status: CallStatus): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    }>;
    endCall(callId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    }>;
    declineCall(callId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    }>;
    missCall(callId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    }>;
    getActiveCall(conversationId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    } | null>;
    getCallHistory(conversationId: string, userId: string, limit?: number, skip?: number): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CallStatus;
        createdAt: Date;
        receiverId: string | null;
        conversationId: string;
        type: import(".prisma/client").$Enums.CallType;
        callerId: string;
        duration: number | null;
        startedAt: Date | null;
        endedAt: Date | null;
    }[]>;
}
export declare const callService: CallService;
//# sourceMappingURL=call.service.d.ts.map