import { withApiAuth, parseBody } from "@/lib/api";
import { gradeSchema } from "@/lib/validators";
import { createGrade, listGrades } from "@/features/grades/service";

export async function GET(request: Request) {
  return withApiAuth(async (user) => {
    const studentId = new URL(request.url).searchParams.get("studentId") ?? undefined;
    return listGrades(user, studentId);
  });
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, gradeSchema);
    return createGrade(user, payload);
  });
}
