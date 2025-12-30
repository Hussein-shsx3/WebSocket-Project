import prisma from "../config/db";
import {
  NotFoundError,
  BadRequestError,
  AuthorizationError,
} from "../types/error.types";

export class ConversationService {
  /**
   * Get or create a private conversation between two friends
   */
  async getOrCreateConversation(userId: string, friendId: string) {
    // Check if friend exists
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
    });

    if (!friend) {
      throw new NotFoundError("Friend not found");
    }

    // Check if they're friends
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      throw new BadRequestError("You must be friends to create a conversation");
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: [userId, friendId] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new private conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          createMany: {
            data: [{ userId }, { userId: friendId }],
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });

    return conversation;
  }

  /**
   * Get all conversations for the user
   */
  async getUserConversations(
    userId: string,
    limit: number = 20,
    skip: number = 0,
    search?: string
  ) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
        AND: search
          ? {
              participants: {
                some: {
                  user: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              },
            }
          : {},
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
      take: limit,
      skip,
    });

    return conversations;
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    // Check if user is part of conversation
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      throw new AuthorizationError("You are not part of this conversation");
    }

    return conversation;
  }

  /**
   * Get the other user in a private conversation
   */
  async getOtherUser(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const participant = conversation.participants.find(
      (p) => p.userId === userId
    );
    if (!participant) {
      throw new AuthorizationError("You are not part of this conversation");
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== userId
    );
    if (!otherParticipant) {
      throw new NotFoundError("Other user not found in conversation");
    }

    return otherParticipant.user;
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      throw new AuthorizationError("You are not part of this conversation");
    }

    // Archive for this user only
    const updated = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { isArchived: true },
    });

    return updated;
  }

  /**
   * Unarchive a conversation
   */
  async unarchiveConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      throw new AuthorizationError("You are not part of this conversation");
    }

    // Unarchive for this user only
    const updated = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { isArchived: false },
    });

    return updated;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );
    if (!isParticipant) {
      throw new AuthorizationError("You are not part of this conversation");
    }

    // Delete all related messages and their data
    await prisma.messageReaction.deleteMany({
      where: {
        message: { conversationId },
      },
    });

    await prisma.messageRead.deleteMany({
      where: {
        message: { conversationId },
      },
    });

    await prisma.message.deleteMany({
      where: { conversationId },
    });

    await prisma.call.deleteMany({
      where: { conversationId },
    });

    // Delete conversation participants
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId },
    });

    // Delete conversation
    await prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * Update conversation's last message timestamp
   */
  async updateConversationLastMessage(conversationId: string) {
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return updated;
  }
}

// Export singleton instance
export const conversationService = new ConversationService();
