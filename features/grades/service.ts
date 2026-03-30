import { Prisma, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getRoleContext } from "@/lib/context";
import { ApiError } from "@/lib/api";
import { assertTeacherAssignment, canAccessStudent } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth/session";

export async function listGrades(user: SessionUser, studentId?: string) {
  const context = await getRoleContext(user);
  const where: Prisma.GradeWhereInput = {};

  if (user.role === Role.STUDENT) {
    where.studentId = context.student?.id;
  } else if (user.role === Role.PARENT) {
    const selectedChild =
      context.children.find((child) => child.id === studentId) ?? context.children[0];
    where.studentId = selectedChild?.id;
  } else if (user.role === Role.TEACHER) {
    const teacher = context.teacher;
    where.teacherId = teacher?.id;
  }

  return db.grade.findMany({
    where,
    include: {
      student: { include: { user: true, schoolClass: true } },
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: { dateAssigned: "desc" },
  });
}

export async function createGrade(
  user: SessionUser,
  payload: {
    studentId: string;
    subjectId: string;
    value: number;
    weight: number;
    type: Prisma.GradeUncheckedCreateInput["type"];
    comment?: string;
    dateAssigned: string;
  },
) {
  if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
    throw new ApiError(403, "You cannot create grades");
  }

  const student = await db.studentProfile.findUnique({
    where: { id: payload.studentId },
    select: { classId: true },
  });
  if (!student?.classId) throw new ApiError(404, "Student not found");

  const allowed = await assertTeacherAssignment(user, {
    classId: student.classId,
    subjectId: payload.subjectId,
  });
  if (!allowed) throw new ApiError(403, "You are not assigned to this student");

  const teacherProfile =
    user.role === Role.TEACHER
      ? await db.teacherProfile.findUnique({ where: { userId: user.id } })
      : null;

  return db.grade.create({
    data: {
      studentId: payload.studentId,
      subjectId: payload.subjectId,
      teacherId: teacherProfile?.id ?? (await db.teacherProfile.findFirstOrThrow()).id,
      value: payload.value,
      weight: payload.weight,
      type: payload.type,
      comment: payload.comment,
      dateAssigned: new Date(payload.dateAssigned),
    },
  });
}

export async function updateGrade(
  user: SessionUser,
  id: string,
  payload: Partial<{
    value: number;
    weight: number;
    comment: string;
    dateAssigned: string;
  }>,
) {
  const grade = await db.grade.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!grade?.student.classId) throw new ApiError(404, "Grade not found");

  const allowed = await assertTeacherAssignment(user, {
    classId: grade.student.classId,
    subjectId: grade.subjectId,
  });
  if (!allowed) throw new ApiError(403, "You cannot edit this grade");

  return db.grade.update({
    where: { id },
    data: {
      ...payload,
      dateAssigned: payload.dateAssigned ? new Date(payload.dateAssigned) : undefined,
    },
  });
}

export async function deleteGrade(user: SessionUser, id: string) {
  const grade = await db.grade.findUnique({
    where: { id },
    include: { student: true },
  });
  if (!grade?.student.classId) throw new ApiError(404, "Grade not found");

  const allowed = await assertTeacherAssignment(user, {
    classId: grade.student.classId,
    subjectId: grade.subjectId,
  });
  if (!allowed) throw new ApiError(403, "You cannot delete this grade");

  await db.grade.delete({ where: { id } });
  return { id };
}

export async function getStudentGrades(user: SessionUser, studentId: string) {
  const allowed = await canAccessStudent(user, studentId);
  if (!allowed) throw new ApiError(403, "Forbidden");

  return db.grade.findMany({
    where: { studentId },
    include: {
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: { dateAssigned: "desc" },
  });
}
