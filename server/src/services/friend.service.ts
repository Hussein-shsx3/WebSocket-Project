import prisma from "../config/db";
import { NotFoundError, BadRequestError } from "../types/error.types";

/**
 * Friend Service
 * Handles all friend-related business logic
 */

/**
 * Send a friend request
 */
export async function sendFriendRequest(senderId: string, receiverId: string) {
  // Check if trying to send request to self
  if (senderId === receiverId) {
    throw new BadRequestError("You cannot send a friend request to yourself");
  }

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    throw new NotFoundError("User not found");
  }

  // Check if already friends
  const existingFriendship = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId: senderId, friendId: receiverId },
        { userId: receiverId, friendId: senderId },
      ],
    },
  });

  if (existingFriendship) {
    throw new BadRequestError("You are already friends with this user");
  }

  // Check if there's an existing PENDING request
  const pendingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId, receiverId, status: "PENDING" },
        { senderId: receiverId, receiverId: senderId, status: "PENDING" },
      ],
    },
  });

  if (pendingRequest) {
    if (pendingRequest.senderId === senderId) {
      throw new BadRequestError("Friend request already sent");
    } else {
      throw new BadRequestError(
        "This user has already sent you a friend request"
      );
    }
  }

  // Upsert: If request exists (REJECTED/ACCEPTED/CANCELLED), update to PENDING. Otherwise create new.
  // This allows resending after rejection or after removing a friend
  return prisma.friendRequest.upsert({
    where: {
      senderId_receiverId: { senderId, receiverId },
    },
    update: {
      status: "PENDING",
    },
    create: {
      senderId,
      receiverId,
      status: "PENDING",
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string, userId: string) {
  // Find the friend request
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError("Friend request not found");
  }

  // Check if user is the receiver
  if (request.receiverId !== userId) {
    throw new BadRequestError("You can only accept requests sent to you");
  }

  // Check if already accepted
  if (request.status === "ACCEPTED") {
    throw new BadRequestError("Friend request already accepted");
  }

  // Check if rejected
  if (request.status === "REJECTED") {
    throw new BadRequestError("Cannot accept a rejected friend request");
  }

  // Use transaction to update request and create friendship
  const result = await prisma.$transaction(async (tx) => {
    // Update friend request status
    const updatedRequest = await tx.friendRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    // Create friendship (bidirectional)
    const friendship = await tx.friend.create({
      data: {
        userId: request.senderId,
        friendId: request.receiverId,
      },
    });

    return { request: updatedRequest, friendship };
  });

  return result;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requestId: string, userId: string) {
  // Find the friend request
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError("Friend request not found");
  }

  // Check if user is the receiver
  if (request.receiverId !== userId) {
    throw new BadRequestError("You can only reject requests sent to you");
  }

  // Check if already rejected
  if (request.status === "REJECTED") {
    throw new BadRequestError("Friend request already rejected");
  }

  // Check if already accepted
  if (request.status === "ACCEPTED") {
    throw new BadRequestError("Cannot reject an accepted friend request");
  }

  // Update status to rejected
  return prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(requestId: string, userId: string) {
  // Find the friend request
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError("Friend request not found");
  }

  // Check if user is the sender
  if (request.senderId !== userId) {
    throw new BadRequestError("You can only cancel requests you sent");
  }

  // Check if already accepted
  if (request.status === "ACCEPTED") {
    throw new BadRequestError("Cannot cancel an accepted friend request");
  }

  // Delete the request
  await prisma.friendRequest.delete({
    where: { id: requestId },
  });

  return { message: "Friend request cancelled successfully" };
}

/**
 * Get friend requests (pending or sent)
 */
export async function getFriendRequests(
  userId: string,
  type: "pending" | "sent",
  limit: number,
  skip: number
) {
  const isPending = type === "pending";

  return prisma.friendRequest.findMany({
    where: {
      ...(isPending ? { receiverId: userId } : { senderId: userId }),
      status: "PENDING",
    },
    include: {
      ...(isPending
        ? {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
              },
            },
          }
        : {
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
              },
            },
          }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
  });
}

/**
 * Get count of friend requests
 */
export async function getFriendRequestsCount(
  userId: string,
  type: "pending" | "sent"
) {
  const isPending = type === "pending";

  return prisma.friendRequest.count({
    where: {
      ...(isPending ? { receiverId: userId } : { senderId: userId }),
      status: "PENDING",
    },
  });
}

/**
 * Get all friends for a user
 */
export async function getFriends(
  userId: string,
  limit: number,
  skip: number,
  search?: string
) {
  // Get friend IDs where user is either userId or friendId
  const friendships = await prisma.friend.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
    },
    select: {
      userId: true,
      friendId: true,
    },
  });

  // Extract friend IDs (exclude current user)
  const friendIds = friendships.map((f) =>
    f.userId === userId ? f.friendId : f.userId
  );

  // Build where clause for search
  const whereClause: any = {
    id: { in: friendIds },
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Get friend details
  return prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      status: true,
    },
    orderBy: { name: "asc" },
    take: limit,
    skip,
  });
}

/**
 * Get friends count
 */
export async function getFriendsCount(userId: string, search?: string) {
  const friendships = await prisma.friend.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
    },
    select: {
      userId: true,
      friendId: true,
    },
  });

  const friendIds = friendships.map((f) =>
    f.userId === userId ? f.friendId : f.userId
  );

  const whereClause: any = {
    id: { in: friendIds },
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.user.count({ where: whereClause });
}

/**
 * Remove a friend
 */
export async function removeFriend(userId: string, friendId: string) {
  // Check if friendship exists
  const friendship = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });

  if (!friendship) {
    throw new NotFoundError("Friendship not found");
  }

  // Delete the friendship
  await prisma.friend.delete({
    where: { id: friendship.id },
  });

  return { message: "Friend removed successfully" };
}
