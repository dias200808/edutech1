import { HomeworkSubmissionStatus, Prisma, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getRoleContext } from "@/lib/context";
import { ApiError } from "@/lib/api";
import { assertTeacherAssignment, getTeacherScope } from "@/lib/permissions";
import type { SessionUser } from "@/lib/auth/session";

type HomeworkPayload = {
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  attachmentName?: string;
  attachmentUrl?: string;
};

function buildAttachmentCreateInput(payload: {
  attachmentName?: string;
  attachmentUrl?: string;
}) {
  if (!payload.attachmentUrl?.trim()) {
    return undefined;
  }

  return {
    fileName: payload.attachmentName?.trim() || "Homework material",
    fileUrl: payload.attachmentUrl.trim(),
  };
}

export async function listHomework(user: SessionUser, studentId?: string) {
  const context = await getRoleContext(user);
  const where: Prisma.HomeworkWhereInput = {};

  let scopedStudentId: string | undefined = studentId;

  if (user.role === Role.STUDENT) {
    where.classId = context.student?.classId ?? undefined;
    scopedStudentId = context.student?.id;
  } else if (user.role === Role.PARENT) {
    const selectedChild = context.children.find((child) => child.id === studentId) ?? context.children[0];
    where.classId = selectedChild?.classId ?? undefined;
    scopedStudentId = selectedChild?.id;
  } else if (user.role === Role.TEACHER) {
    const scope = await getTeacherScope(user);
    where.OR = scope?.assignments.map((assignment) => ({
      classId: assignment.classId,
      subjectId: assignment.subjectId,
    }));
  }

  return db.homework.findMany({
    where,
    include: {
      schoolClass: true,
      subject: true,
      teacher: { include: { user: true } },
      attachments: true,
      submissions: scopedStudentId
        ? {
            where: { studentId: scopedStudentId },
            include: { student: { include: { user: true } } },
          }
        : {
            include: { student: { include: { user: true } } },
          },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function createHomework(user: SessionUser, payload: HomeworkPayload) {
  if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
    throw new ApiError(403, "You cannot create homework");
  }

  const allowed = await assertTeacherAssignment(user, {
    classId: payload.classId,
    subjectId: payload.subjectId,
  });
  if (!allowed) {
    throw new ApiError(403, "You are not assigned to this class and subject");
  }

  const teacherProfile =
    user.role === Role.TEACHER ? await db.teacherProfile.findUnique({ where: { userId: user.id } }) : null;

  const attachment = buildAttachmentCreateInput(payload);

  const homework = await db.homework.create({
    data: {
      classId: payload.classId,
      subjectId: payload.subjectId,
      teacherId: teacherProfile?.id ?? (await db.teacherProfile.findFirstOrThrow()).id,
      title: payload.title,
      description: payload.description,
      dueDate: new Date(payload.dueDate),
      attachments: attachment ? { create: attachment } : undefined,
    },
  });

  const students = await db.studentProfile.findMany({
    where: { classId: payload.classId },
    select: { id: true },
  });

  if (students.length) {
    await db.homeworkSubmission.createMany({
      data: students.map((student) => ({
        homeworkId: homework.id,
        studentId: student.id,
        status: HomeworkSubmissionStatus.NOT_SUBMITTED,
      })),
    });
  }

  return homework;
}

export async function updateHomework(
  user: SessionUser,
  id: string,
  payload: Partial<HomeworkPayload>,
) {
  const existing = await db.homework.findUnique({ where: { id }, include: { attachments: true } });
  if (!existing) throw new ApiError(404, "Homework not found");

  const targetClassId = payload.classId ?? existing.classId;
  const targetSubjectId = payload.subjectId ?? existing.subjectId;
  const allowed = await assertTeacherAssignment(user, {
    classId: targetClassId,
    subjectId: targetSubjectId,
  });
  if (!allowed) throw new ApiError(403, "You cannot edit this homework");

  const shouldTouchAttachment =
    Object.prototype.hasOwnProperty.call(payload, "attachmentUrl") ||
    Object.prototype.hasOwnProperty.call(payload, "attachmentName");
  const attachment = buildAttachmentCreateInput({
    attachmentName: payload.attachmentName,
    attachmentUrl: payload.attachmentUrl,
  });

  return db.homework.update({
    where: { id },
    data: {
      classId: payload.classId,
      subjectId: payload.subjectId,
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : undefined,
      attachments: shouldTouchAttachment
        ? {
            deleteMany: {},
            ...(attachment ? { create: attachment } : {}),
          }
        : undefined,
    },
  });
}

export async function deleteHomework(user: SessionUser, id: string) {
  const existing = await db.homework.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Homework not found");

  const allowed = await assertTeacherAssignment(user, {
    classId: existing.classId,
    subjectId: existing.subjectId,
  });
  if (!allowed) throw new ApiError(403, "You cannot delete this homework");

  await db.homework.delete({ where: { id } });
  return { id };
}

export async function submitHomework(
  user: SessionUser,
  homeworkId: string,
  payload: {
    content: string;
    attachmentUrl?: string;
  },
) {
  if (user.role !== Role.STUDENT) throw new ApiError(403, "Only students can submit homework");

  const context = await getRoleContext(user);
  const studentId = context.student?.id;
  if (!studentId) throw new ApiError(403, "Student profile missing");

  return db.homeworkSubmission.upsert({
    where: {
      homeworkId_studentId: {
        homeworkId,
        studentId,
      },
    },
    update: {
      content: payload.content,
      attachmentUrl: payload.attachmentUrl || null,
      submittedAt: new Date(),
      status: HomeworkSubmissionStatus.SUBMITTED,
    },
    create: {
      homeworkId,
      studentId,
      content: payload.content,
      attachmentUrl: payload.attachmentUrl || null,
      submittedAt: new Date(),
      status: HomeworkSubmissionStatus.SUBMITTED,
    },
  });
}

export async function getHomeworkDetail(user: SessionUser, id: string) {
  const homework = await db.homework.findUnique({
    where: { id },
    include: {
      schoolClass: true,
      subject: true,
      teacher: { include: { user: true } },
      attachments: true,
      submissions: {
        include: {
          student: { include: { user: true, schoolClass: true } },
        },
      },
    },
  });

  if (!homework) throw new ApiError(404, "Homework not found");

  if (user.role === Role.STUDENT) {
    const context = await getRoleContext(user);
    if (context.student?.classId !== homework.classId) throw new ApiError(403, "Forbidden");
  }

  if (user.role === Role.PARENT) {
    const context = await getRoleContext(user);
    const canSee = context.children.some((child) => child.classId === homework.classId);
    if (!canSee) throw new ApiError(403, "Forbidden");
  }

  return homework;
}
