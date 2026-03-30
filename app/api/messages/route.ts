import { withApiAuth, parseBody } from "@/lib/api";
import { messageSchema } from "@/lib/validators";
import { sendMessage } from "@/features/messages/service";

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, messageSchema);
    return sendMessage(user, payload);
  });
}
