import { Prisma, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getRoleContext } from "@/lib/context";
import { ApiError } from "@/lib/api";
import { assertTeacherAssignment, canAccessStudent } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth/session";

export async function listAttendance(user: SessionUser, studentId?: string) {
  const context = await getRoleContext(user);
  const where: Prisma.AttendanceWhereInput = {};

  if (user.role === Role.STUDENT) {
    where.studentId = context.student?.id;
  } else if (user.role === Role.PARENT) {
    const selectedChild =
      context.children.find((child) => child.id === studentId) ?? context.children[0];
    where.studentId = selectedChild?.id;
  } else if (user.role === Role.TEACHER) {
    where.timetableEntry = { teacherId: context.teacher?.id };
  }

  return db.attendance.findMany({
    where,
    include: {
      student: { include: { user: true, schoolClass: true } },
      timetableEntry: {
        include: {
          subject: true,
          schoolClass: true,
          teacher: { include: { user: true } },
        },
      },
      markedBy: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function createAttendance(
  user: SessionUser,
  payload: {
    studentId: string;
    timetableEntryId: string;
    date: string;
    status: Prisma.AttendanceUncheckedCreateInput["status"];
    reason?: string;
    note?: string;
  },
) {
  if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
    throw new ApiError(403, "You cannot mark attendance");
  }

  const student = await db.studentProfile.findUnique({
    where: { id: payload.studentId },
    select: { classId: true },
  });
  const entry = await db.timetableEntry.findUnique({
    where: { id: payload.timetableEntryId },
    select: { classId: true, subjectId: true },
  });

  if (!student?.classId || !entry) throw new ApiError(404, "Student or timetable entry not found");

  const allowed = await assertTeacherAssignment(user, {
    classId: entry.classId,
    subjectId: entry.subjectId,
  });
  if (!allowed) throw new ApiError(403, "You cannot mark attendance for this lesson");

  return db.attendance.upsert({
    where: {
      studentId_timetableEntryId_date: {
        studentId: payload.studentId,
        timetableEntryId: payload.timetableEntryId,
        date: new Date(payload.date),
      },
    },
    create: {
      studentId: payload.studentId,
      timetableEntryId: payload.timetableEntryId,
      date: new Date(payload.date),
      status: payload.status,
      reason: payload.reason,
      note: payload.note,
      markedByUserId: user.id,
    },
    update: {
      status: payload.status,
      reason: payload.reason,
      note: payload.note,
      markedByUserId: user.id,
    },
  });
}

export async function updateAttendance(
  user: SessionUser,
  id: string,
  payload: Partial<{
    status: Prisma.AttendanceUncheckedUpdateInput["status"];
    reason: string;
    note: string;
  }>,
) {
  const attendance = await db.attendance.findUnique({
    where: { id },
    include: {
      timetableEntry: true,
    },
  });

  if (!attendance) throw new ApiError(404, "Attendance record not found");

  const allowed = await assertTeacherAssignment(user, {
    classId: attendance.timetableEntry.classId,
    subjectId: attendance.timetableEntry.subjectId,
  });
  if (!allowed) throw new ApiError(403, "You cannot update this attendance record");

  return db.attendance.update({
    where: { id },
    data: payload,
  });
}

export async function getStudentAttendance(user: SessionUser, studentId: string) {
  const allowed = await canAccessStudent(user, studentId);
  if (!allowed) throw new ApiError(403, "Forbidden");

  return db.attendance.findMany({
    where: { studentId },
    include: {
      timetableEntry: {
        include: {
          subject: true,
          teacher: { include: { user: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}
