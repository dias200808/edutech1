import { withApiAuth } from "@/lib/api";
import { buildAdminOverview } from "@/features/reports/service";

export async function GET() {
  return withApiAuth((user) => buildAdminOverview(user));
}
