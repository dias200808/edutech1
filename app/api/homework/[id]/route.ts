import { withApiAuth, parseBody } from "@/lib/api";
import { homeworkSchema } from "@/lib/validators";
import { deleteHomework, getHomeworkDetail, updateHomework } from "@/features/homework/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return getHomeworkDetail(user, id);
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, homeworkSchema.partial());
    const { id } = await params;
    return updateHomework(user, id, payload);
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return deleteHomework(user, id);
  });
}
