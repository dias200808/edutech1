import { withApiAuth, parseBody } from "@/lib/api";
import { attendanceSchema } from "@/lib/validators";
import { updateAttendance } from "@/features/attendance/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, attendanceSchema.partial());
    const { id } = await params;
    return updateAttendance(user, id, payload);
  });
}
