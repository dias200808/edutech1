import { withApiAuth, parseBody } from "@/lib/api";
import { attendanceSchema } from "@/lib/validators";
import { createAttendance, listAttendance } from "@/features/attendance/service";

export async function GET(request: Request) {
  return withApiAuth(async (user) => {
    const studentId = new URL(request.url).searchParams.get("studentId") ?? undefined;
    return listAttendance(user, studentId);
  });
}

export async function POST(request: Request) {
  return withApiAuth(async (user) => {
    const payload = await parseBody(request, attendanceSchema);
    return createAttendance(user, payload);
  });
}
