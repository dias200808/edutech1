import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { canAccessStudent, getAccessibleStudentIds } from "@/lib/permissions";
import { buildStudentReport } from "@/features/reports/service";
import type { SessionUser } from "@/lib/auth/session";

export async function listStudents(user: SessionUser) {
  const ids = await getAccessibleStudentIds(user);
  return db.studentProfile.findMany({
    where: user.role === Role.ADMIN ? undefined : { id: { in: ids } },
    include: {
      user: true,
      schoolClass: true,
      parents: {
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: [{ schoolClass: { name: "asc" } }, { user: { lastName: "asc" } }],
  });
}

export async function getStudent(user: SessionUser, studentId: string) {
  const allowed = await canAccessStudent(user, studentId);
  if (!allowed) throw new ApiError(403, "Forbidden");

  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      schoolClass: true,
      parents: {
        include: {
          parent: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!student) throw new ApiError(404, "Student not found");
  return student;
}

export async function getStudentDashboard(user: SessionUser, studentId: string) {
  return buildStudentReport(user, studentId);
}
