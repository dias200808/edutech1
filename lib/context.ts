import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth/session";

export async function getRoleContext(user: SessionUser) {
  if (user.role === Role.STUDENT) {
    const student = await db.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        schoolClass: true,
      },
    });

    return {
      student,
      parent: null,
      teacher: null,
      children: [],
    };
  }

  if (user.role === Role.PARENT) {
    const parent = await db.parentProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        children: {
          include: {
            student: {
              include: {
                user: true,
                schoolClass: true,
              },
            },
          },
        },
      },
    });

    return {
      student: null,
      parent,
      teacher: null,
      children: parent?.children.map((relation) => relation.student) ?? [],
    };
  }

  if (user.role === Role.TEACHER) {
    const teacher = await db.teacherProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        assignments: {
          include: {
            schoolClass: true,
            subject: true,
          },
        },
      },
    });

    return {
      student: null,
      parent: null,
      teacher,
      children: [],
    };
  }

  return {
    student: null,
    parent: null,
    teacher: null,
    children: [],
  };
}
