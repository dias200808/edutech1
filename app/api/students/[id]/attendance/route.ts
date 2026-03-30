import { withApiAuth } from "@/lib/api";
import { getStudentAttendance } from "@/features/attendance/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return getStudentAttendance(user, id);
  });
}
