import { createSession } from "@/lib/auth/session";
import { fail, parseBody } from "@/lib/api";
import { loginSchema } from "@/lib/validators";
import { authenticateUser } from "@/features/auth/service";

export async function POST(request: Request) {
  try {
    const payload = await parseBody(request, loginSchema);
    const user = await authenticateUser(payload.email, payload.password);

    if (!user) {
      return fail(401, "Invalid email or password");
    }

    await createSession(user);

    return Response.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    return fail(400, "Unable to login", error);
  }
}
