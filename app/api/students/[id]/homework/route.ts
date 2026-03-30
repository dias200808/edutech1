import { withApiAuth, ApiError } from "@/lib/api";
import { canAccessStudent } from "@/lib/permissions";
import { listHomework } from "@/features/homework/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    const allowed = await canAccessStudent(user, id);
    if (!allowed) throw new ApiError(403, "Forbidden");
    return listHomework(user, id);
  });
}
