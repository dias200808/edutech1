import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import type { SessionUser } from "@/lib/auth/session";

function assertAdmin(user: SessionUser) {
  if (user.role !== Role.ADMIN) throw new ApiError(403, "Admin only");
}

export async function listUsers(user: SessionUser) {
  assertAdmin(user);
  return db.user.findMany({
    include: {
      studentProfile: { include: { schoolClass: true } },
      teacherProfile: true,
      parentProfile: true,
    },
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
  });
}

export async function createUser(
  user: SessionUser,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: Role;
    isActive?: boolean;
  },
) {
  assertAdmin(user);

  const passwordHash = await hashPassword(payload.password);
  return db.user.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      isActive: payload.isActive ?? true,
      passwordHash,
    },
  });
}

export async function updateUser(
  user: SessionUser,
  id: string,
  payload: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: Role;
    isActive?: boolean;
  }>,
) {
  assertAdmin(user);

  return db.user.update({
    where: { id },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      isActive: payload.isActive,
      passwordHash: payload.password ? await hashPassword(payload.password) : undefined,
    },
  });
}

export async function deleteUser(user: SessionUser, id: string) {
  assertAdmin(user);
  await db.user.delete({ where: { id } });
  return { id };
}

export async function getAdminCollections(user: SessionUser) {
  assertAdmin(user);
  const [classes, subjects, students, parents, teachers, timetable] = await Promise.all([
    db.schoolClass.findMany({
      include: {
        students: {
          include: {
            user: true,
          },
          orderBy: {
            user: { lastName: "asc" },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    db.subject.findMany({ orderBy: { name: "asc" } }),
    db.studentProfile.findMany({ include: { user: true, schoolClass: true } }),
    db.parentProfile.findMany({ include: { user: true, children: true } }),
    db.teacherProfile.findMany({ include: { user: true, assignments: true } }),
    db.timetableEntry.findMany({
      include: {
        schoolClass: true,
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return { classes, subjects, students, parents, teachers, timetable };
}

async function assertEntitiesExist(params: {
  classId: string;
  subjectId: string;
  teacherId: string;
}) {
  const [schoolClass, subject, teacher] = await Promise.all([
    db.schoolClass.findUnique({ where: { id: params.classId } }),
    db.subject.findUnique({ where: { id: params.subjectId } }),
    db.teacherProfile.findUnique({ where: { id: params.teacherId } }),
  ]);

  if (!schoolClass) throw new ApiError(404, "Class not found");
  if (!subject) throw new ApiError(404, "Subject not found");
  if (!teacher) throw new ApiError(404, "Teacher not found");
}

async function ensureTeacherAssignment(params: {
  classId: string;
  subjectId: string;
  teacherId: string;
}) {
  await db.teacherSubjectClass.upsert({
    where: {
      teacherId_subjectId_classId: {
        teacherId: params.teacherId,
        subjectId: params.subjectId,
        classId: params.classId,
      },
    },
    update: {},
    create: {
      teacherId: params.teacherId,
      subjectId: params.subjectId,
      classId: params.classId,
    },
  });
}

export async function assignStudentToClass(
  user: SessionUser,
  payload: { classId: string; studentId: string },
) {
  assertAdmin(user);

  const [schoolClass, student] = await Promise.all([
    db.schoolClass.findUnique({ where: { id: payload.classId } }),
    db.studentProfile.findUnique({ where: { id: payload.studentId } }),
  ]);

  if (!schoolClass) throw new ApiError(404, "Class not found");
  if (!student) throw new ApiError(404, "Student not found");

  return db.studentProfile.update({
    where: { id: payload.studentId },
    data: { classId: payload.classId },
    include: {
      user: true,
      schoolClass: true,
    },
  });
}

export async function removeStudentFromClass(
  user: SessionUser,
  payload: { studentId: string },
) {
  assertAdmin(user);

  const student = await db.studentProfile.findUnique({ where: { id: payload.studentId } });
  if (!student) throw new ApiError(404, "Student not found");

  return db.studentProfile.update({
    where: { id: payload.studentId },
    data: { classId: null },
    include: {
      user: true,
      schoolClass: true,
    },
  });
}

export async function createTimetableEntry(
  user: SessionUser,
  payload: {
    classId: string;
    subjectId: string;
    teacherId: string;
    room: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  },
) {
  assertAdmin(user);
  await assertEntitiesExist(payload);
  await ensureTeacherAssignment(payload);

  return db.timetableEntry.create({
    data: payload,
    include: {
      schoolClass: true,
      subject: true,
      teacher: { include: { user: true } },
    },
  });
}

export async function updateTimetableEntry(
  user: SessionUser,
  id: string,
  payload: Partial<{
    classId: string;
    subjectId: string;
    teacherId: string;
    room: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>,
) {
  assertAdmin(user);

  const existing = await db.timetableEntry.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Timetable entry not found");

  const nextState = {
    classId: payload.classId ?? existing.classId,
    subjectId: payload.subjectId ?? existing.subjectId,
    teacherId: payload.teacherId ?? existing.teacherId,
    room: payload.room ?? existing.room,
    dayOfWeek: payload.dayOfWeek ?? existing.dayOfWeek,
    startTime: payload.startTime ?? existing.startTime,
    endTime: payload.endTime ?? existing.endTime,
  };

  await assertEntitiesExist(nextState);
  await ensureTeacherAssignment(nextState);

  return db.timetableEntry.update({
    where: { id },
    data: nextState,
    include: {
      schoolClass: true,
      subject: true,
      teacher: { include: { user: true } },
    },
  });
}

export async function deleteTimetableEntry(user: SessionUser, id: string) {
  assertAdmin(user);
  await db.timetableEntry.delete({ where: { id } });
  return { id };
}
