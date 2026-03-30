import { withApiAuth, parseBody } from "@/lib/api";
import { homeworkSchema } from "@/lib/validators";
import { createHomework, listHomework } from "@/features/homework/service";

export async function GET(request: Request) {
  return withApiAuth(async (user) => {
    const studentId = new URL(request.url).searchParams.get("studentId") ?? undefined;
    return listHomework(user, studentId);
  });
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, homeworkSchema);
    return createHomework(user, payload);
  });
}
