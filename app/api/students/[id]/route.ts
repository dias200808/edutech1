import { withApiAuth } from "@/lib/api";
import { getStudent } from "@/features/students/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return getStudent(user, id);
  });
}
