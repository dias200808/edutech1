import { withApiAuth, parseBody } from "@/lib/api";
import { timetableEntrySchema } from "@/lib/validators";
import { createTimetableEntry } from "@/features/admin/service";

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, timetableEntrySchema);
    return createTimetableEntry(user, payload);
  });
}
