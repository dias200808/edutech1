import { withApiAuth, parseBody } from "@/lib/api";
import { aiRequestSchema } from "@/lib/validators";
import { generateDaySummary } from "@/features/ai/service";

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, aiRequestSchema);
    return generateDaySummary(user, payload.studentId);
  });
}
