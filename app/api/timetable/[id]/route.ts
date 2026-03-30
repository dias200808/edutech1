import { withApiAuth, parseBody } from "@/lib/api";
import { timetableEntrySchema } from "@/lib/validators";
import { deleteTimetableEntry, updateTimetableEntry } from "@/features/admin/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, timetableEntrySchema.partial());
    const { id } = await params;
    return updateTimetableEntry(user, id, payload);
  });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return deleteTimetableEntry(user, id);
  });
}
