import { withApiAuth } from "@/lib/api";
import { buildClassReport } from "@/features/reports/service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return withApiAuth(async (user) => {
    const { id } = await params;
    return buildClassReport(user, id);
  });
}
