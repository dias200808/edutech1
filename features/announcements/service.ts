import { AnnouncementTargetRole, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getRoleContext } from "@/lib/context";
import { ApiError } from "@/lib/api";
import type { SessionUser } from "@/lib/auth/session";

export async function listAnnouncements(user: SessionUser, studentId?: string) {
  const context = await getRoleContext(user);
  const classId =
    user.role === Role.STUDENT
      ? context.student?.classId
      : user.role === Role.PARENT
        ? (context.children.find((child) => child.id === studentId) ?? context.children[0])?.classId
        : undefined;

  const allowedTargets: AnnouncementTargetRole[] = [AnnouncementTargetRole.ALL];
  if (user.role === Role.STUDENT) allowedTargets.push(AnnouncementTargetRole.STUDENT);
  if (user.role === Role.PARENT) allowedTargets.push(AnnouncementTargetRole.PARENT);
  if (user.role === Role.TEACHER) allowedTargets.push(AnnouncementTargetRole.TEACHER);
  if (user.role === Role.ADMIN) allowedTargets.push(AnnouncementTargetRole.ADMIN);

  return db.announcement.findMany({
    where: {
      OR: [
        { targetRole: { in: allowedTargets } },
        classId ? { classId } : {},
      ],
    },
    include: {
      author: true,
      schoolClass: true,
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAnnouncement(
  user: SessionUser,
  payload: {
    title: string;
    content: string;
    targetRole: AnnouncementTargetRole;
    classId?: string | null;
    isPinned?: boolean;
  },
) {
  if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
    throw new ApiError(403, "You cannot create announcements");
  }

  return db.announcement.create({
    data: {
      authorId: user.id,
      title: payload.title,
      content: payload.content,
      targetRole: payload.targetRole,
      classId: payload.classId || null,
      isPinned: payload.isPinned ?? false,
    },
  });
}

export async function updateAnnouncement(
  user: SessionUser,
  id: string,
  payload: Partial<{
    title: string;
    content: string;
    targetRole: AnnouncementTargetRole;
    classId?: string | null;
    isPinned?: boolean;
  }>,
) {
  const announcement = await db.announcement.findUnique({ where: { id } });
  if (!announcement) throw new ApiError(404, "Announcement not found");
  if (user.role !== Role.ADMIN && announcement.authorId !== user.id) {
    throw new ApiError(403, "You cannot update this announcement");
  }

  return db.announcement.update({
    where: { id },
    data: payload,
  });
}
