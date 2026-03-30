import { Role } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";

export default async function SystemSettingsPage() {
  await requireRole([Role.ADMIN]);

  return (
    <div className="space-y-8">
      <PageHeader title="System Settings" description="High-level platform configuration notes for the demo MVP." />
      <Card>
        <CardHeader>
          <CardTitle>Platform notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--muted)]">
          <p>Authentication uses a secure HTTP-only JWT cookie.</p>
          <p>AI endpoints are backend-only and grounded in live Prisma queries.</p>
          <p>Role permissions are enforced in shared service and route helpers.</p>
          <p>Demo mode depends on seeded PostgreSQL data and optional OpenAI credentials.</p>
        </CardContent>
      </Card>
    </div>
  );
}
