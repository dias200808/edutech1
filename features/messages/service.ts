import { MessageThreadType, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import type { SessionUser } from "@/lib/auth/session";

async function assertThreadParticipant(userId: string, threadId: string) {
  const participant = await db.messageParticipant.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId,
      },
    },
  });

  if (!participant) throw new ApiError(403, "Forbidden");
}

async function assertCanInvite(user: SessionUser, participantIds: string[]) {
  if (user.role === Role.ADMIN || user.role === Role.TEACHER) return true;

  const users = await db.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true, role: true },
  });

  const valid = users.every((target) =>
    target.role === Role.TEACHER || target.role === Role.ADMIN || target.role === Role.PARENT,
  );
  if (!valid) throw new ApiError(403, "One or more participants are not allowed");
}

export async function listThreads(user: SessionUser) {
  const threads = await db.messageThread.findMany({
    where: {
      participants: {
        some: { userId: user.id },
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const unreadCounts = await db.message.findMany({
    where: {
      thread: {
        participants: {
          some: { userId: user.id },
        },
      },
      senderId: { not: user.id },
      readStates: {
        none: { userId: user.id },
      },
    },
    select: { threadId: true },
  });

  const unreadByThread = unreadCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.threadId] = (acc[item.threadId] || 0) + 1;
    return acc;
  }, {});

  return threads.map((thread) => ({
    ...thread,
    unreadCount: unreadByThread[thread.id] || 0,
  }));
}

export async function createThread(
  user: SessionUser,
  payload: {
    type: MessageThreadType;
    title?: string;
    participantIds: string[];
  },
) {
  const participantIds = [...new Set([user.id, ...payload.participantIds])];
  await assertCanInvite(user, participantIds.filter((id) => id !== user.id));

  return db.messageThread.create({
    data: {
      type: payload.type,
      title: payload.title,
      participants: {
        createMany: {
          data: participantIds.map((participantId) => ({ userId: participantId })),
        },
      },
    },
  });
}

export async function getThreadMessages(user: SessionUser, threadId: string) {
  await assertThreadParticipant(user.id, threadId);

  const thread = await db.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        include: { user: true },
      },
      messages: {
        include: {
          sender: true,
          readStates: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!thread) throw new ApiError(404, "Thread not found");

  const unreadMessages = thread.messages.filter(
    (message) =>
      message.senderId !== user.id &&
      !message.readStates.some((state) => state.userId === user.id),
  );

  if (unreadMessages.length) {
    await db.messageReadState.createMany({
      data: unreadMessages.map((message) => ({
        messageId: message.id,
        userId: user.id,
        readAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  return thread;
}

export async function sendMessage(
  user: SessionUser,
  payload: {
    threadId: string;
    content: string;
    attachmentUrl?: string;
  },
) {
  await assertThreadParticipant(user.id, payload.threadId);

  return db.message.create({
    data: {
      threadId: payload.threadId,
      senderId: user.id,
      content: payload.content,
      attachmentUrl: payload.attachmentUrl || null,
    },
    include: {
      sender: true,
    },
  });
}
