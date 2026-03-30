import { Role } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { getAdminCollections } from "@/features/admin/service";

export default async function SubjectsPage() {
  const user = await requireRole([Role.ADMIN]);
  const data = await getAdminCollections(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Subjects" description="Review subject catalog, colors, and codes used across timetable and gradebook flows." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.subjects.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 py-6">
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.code}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
