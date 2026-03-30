import { withApiAuth, parseBody } from "@/lib/api";
import { aiRequestSchema } from "@/lib/validators";
import { explainTopic } from "@/features/ai/service";

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, aiRequestSchema);
    return explainTopic(user, payload.topic);
  });
}
