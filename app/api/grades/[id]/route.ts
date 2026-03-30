import { withApiAuth, parseBody } from "@/lib/api";
import { gradeSchema } from "@/lib/validators";
import { deleteGrade, updateGrade } from "@/features/grades/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, gradeSchema.partial());
    const { id } = await params;
    return updateGrade(user, id, payload);
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return deleteGrade(user, id);
  });
}
