import { withApiAuth, parseBody } from "@/lib/api";
import { eventSchema } from "@/lib/validators";
import { createEvent, listEvents } from "@/features/calendar/service";

export async function GET(request: Request) {
  return withApiAuth(async (user) => {
    const studentId = new URL(request.url).searchParams.get("studentId") ?? undefined;
    return listEvents(user, studentId);
  });
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, eventSchema);
    return createEvent(user, payload);
  });
}
