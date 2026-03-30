import { withApiAuth } from "@/lib/api";

export async function GET() {
  return withApiAuth(async (user) => user);
}
