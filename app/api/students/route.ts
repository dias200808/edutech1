import { withApiAuth } from "@/lib/api";
import { listStudents } from "@/features/students/service";

export async function GET() {
  return withApiAuth((user) => listStudents(user));
}
