import { withApiAuth } from "@/lib/api";
import { generateTeacherSummary } from "@/features/ai/service";

export async function POST() {
  return withApiAuth((user) => generateTeacherSummary(user));
}
