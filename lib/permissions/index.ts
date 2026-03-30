import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth/session";

export function isRole(user: SessionUser, roles: Role[]) {
  return roles.includes(user.role);
}

export async function getAccessibleStudentIds(user: SessionUser) {
  if (user.role === Role.ADMIN) {
    const students = await db.studentProfile.findMany({ select: { id: true } });
    return students.map((student) => student.id);
  }

  if (user.role === Role.STUDENT) {
    const profile = await db.studentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    return profile ? [profile.id] : [];
  }

  if (user.role === Role.PARENT) {
    const profile = await db.parentProfile.findUnique({
      where: { userId: user.id },
      include: { children: { select: { studentId: true } } },
    });
    return profile?.children.map((child) => child.studentId) ?? [];
  }

  const profile = await db.teacherProfile.findUnique({
    where: { userId: user.id },
    include: { assignments: { select: { classId: true } } },
  });
  if (!profile) return [];

  const classIds = [...new Set(profile.assignments.map((item) => item.classId))];
  const students = await db.studentProfile.findMany({
    where: { classId: { in: classIds } },
    select: { id: true },
  });
  return students.map((student) => student.id);
}

export async function canAccessStudent(user: SessionUser, studentId: string) {
  const accessibleIds = await getAccessibleStudentIds(user);
  return accessibleIds.includes(studentId);
}

export async function getTeacherScope(user: SessionUser) {
  if (user.role !== Role.TEACHER) return null;
  return db.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      assignments: {
        include: {
          subject: true,
          schoolClass: true,
        },
      },
    },
  });
}

export async function assertTeacherAssignment(
  user: SessionUser,
  params: { classId: string; subjectId?: string },
) {
  if (user.role === Role.ADMIN) return true;
  if (user.role !== Role.TEACHER) return false;

  const scope = await getTeacherScope(user);
  if (!scope) return false;

  return scope.assignments.some(
    (assignment) =>
      assignment.classId === params.classId &&
      (!params.subjectId || assignment.subjectId === params.subjectId),
  );
}

export function allowRoles(user: SessionUser, roles: Role[]) {
  return roles.includes(user.role);
}
