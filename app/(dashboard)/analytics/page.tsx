import { Role } from "@prisma/client";
import { TrendChart, DonutChart } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { buildAdminOverview } from "@/features/reports/service";

export default async function AnalyticsPage() {
  const user = await requireRole([Role.ADMIN]);
  const overview = await buildAdminOverview(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Quick executive analytics for adoption and operational activity." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User mix</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={[
                { label: "Students", value: overview.studentCount },
                { label: "Teachers", value: overview.teacherCount },
                { label: "Parents", value: overview.parentCount },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity signals</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={[
                { label: "Users", value: overview.userCount },
                { label: "Announcements", value: overview.announcementCount },
                { label: "Events", value: overview.eventCount },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
