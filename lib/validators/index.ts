import { AnnouncementTargetRole, AttendanceStatus, EventType, GradeType, HomeworkSubmissionStatus, MessageThreadType, Role } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const userCreateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  phone: z.string().optional(),
  role: z.nativeEnum(Role),
  password: z.string().min(6),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).optional(),
});

export const homeworkSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  dueDate: z.string().min(1),
  attachmentName: z.string().optional(),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

export const homeworkSubmissionSchema = z.object({
  content: z.string().min(2),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  status: z.nativeEnum(HomeworkSubmissionStatus).optional(),
});

export const gradeSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  value: z.coerce.number().min(1).max(100),
  weight: z.coerce.number().min(0.1).max(5).default(1),
  type: z.nativeEnum(GradeType),
  comment: z.string().optional(),
  dateAssigned: z.string().min(1),
});

export const attendanceSchema = z.object({
  studentId: z.string().min(1),
  timetableEntryId: z.string().min(1),
  date: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus),
  reason: z.string().optional(),
  note: z.string().optional(),
});

export const classRosterSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
});

export const timetableEntrySchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  room: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(1).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export const threadSchema = z.object({
  type: z.nativeEnum(MessageThreadType).default(MessageThreadType.DIRECT),
  title: z.string().optional(),
  participantIds: z.array(z.string()).min(1),
});

export const messageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(1),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
});

export const announcementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  targetRole: z.nativeEnum(AnnouncementTargetRole),
  classId: z.string().optional().nullable(),
  isPinned: z.boolean().default(false),
});

export const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  type: z.nativeEnum(EventType),
  classId: z.string().optional().nullable(),
});

export const aiRequestSchema = z.object({
  studentId: z.string().optional(),
  threadId: z.string().optional(),
  topic: z.string().optional(),
  message: z.string().optional(),
  question: z.string().optional(),
});
