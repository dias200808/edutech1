import { withApiAuth, parseBody } from "@/lib/api";
import { threadSchema } from "@/lib/validators";
import { createThread, listThreads } from "@/features/messages/service";

export async function GET() {
  return withApiAuth((user) => listThreads(user));
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, threadSchema);
    return createThread(user, payload);
  });
}
