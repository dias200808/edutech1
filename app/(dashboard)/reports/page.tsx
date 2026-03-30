import { Role } from "@prisma/client";
import { ChildSwitcher } from "@/components/forms/child-switcher";
import { TrendChart, DonutChart } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { getRoleContext } from "@/lib/context";
import { buildAdminOverview, buildStudentReport } from "@/features/reports/service";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await requireSession();
  const { studentId } = await searchParams;
  const context = await getRoleContext(user);

  if (user.role === Role.ADMIN) {
    const overview = await buildAdminOverview(user);
    return (
      <div className="space-y-8">
        <PageHeader title="Reports" description="School-wide analytics spanning users, announcements, events, and institutional activity." />
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={[
                  { label: "Students", value: overview.studentCount },
                  { label: "Teachers", value: overview.teacherCount },
                  { label: "Parents", value: overview.parentCount },
                  { label: "Other users", value: Math.max(overview.userCount - overview.studentCount - overview.teacherCount - overview.parentCount, 0) },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity overview</CardTitle>
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

  const selectedStudent =
    user.role === Role.STUDENT
      ? context.student?.id
      : context.children.find((child) => child.id === studentId)?.id ?? context.children[0]?.id;

  const report = selectedStudent ? await buildStudentReport(user, selectedStudent) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Review academic progress, attendance distribution, and subject-level performance over time."
        action={
          user.role === Role.PARENT && context.children.length ? (
            <ChildSwitcher
              options={context.children.map((child) => ({
                id: child.id,
                label: `${child.user.firstName} ${child.user.lastName}`,
              }))}
            />
          ) : null
        }
      />

      {report ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Subject averages</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={report.subjectAverages.map((item) => ({ label: item.subject, value: item.average }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Attendance summary</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={[
                  { label: "Present", value: report.attendanceSummary.present },
                  { label: "Absent", value: report.attendanceSummary.absent },
                  { label: "Late", value: report.attendanceSummary.late },
                  { label: "Excused", value: report.attendanceSummary.excused },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
