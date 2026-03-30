import { withApiAuth, parseBody } from "@/lib/api";
import { userCreateSchema } from "@/lib/validators";
import { createUser, listUsers } from "@/features/admin/service";

export async function GET() {
  return withApiAuth((user) => listUsers(user));
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, userCreateSchema);
    return createUser(user, payload);
  });
}
