import { withApiAuth, parseBody } from "@/lib/api";
import { classRosterSchema } from "@/lib/validators";
import { assignStudentToClass, removeStudentFromClass } from "@/features/admin/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, classRosterSchema);
    const { id } = await params;
    return assignStudentToClass(user, {
      classId: id,
      studentId: payload.studentId,
    });
  });
}

export async function DELETE(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, classRosterSchema.pick({ studentId: true }));
    return removeStudentFromClass(user, payload);
  });
}
