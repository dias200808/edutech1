import { withApiAuth } from "@/lib/api";
import { getStudentGrades } from "@/features/grades/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return getStudentGrades(user, id);
  });
}
