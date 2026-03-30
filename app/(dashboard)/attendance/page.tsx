import { Role } from "@prisma/client";
import { AttendanceForm } from "@/components/forms/attendance-form";
import { ChildSwitcher } from "@/components/forms/child-switcher";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireSession } from "@/lib/auth/session";
import { getRoleContext } from "@/lib/context";
import { formatDate } from "@/lib/utils";
import { listAttendance } from "@/features/attendance/service";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await requireSession();
  const { studentId } = await searchParams;
  const context = await getRoleContext(user);
  const attendance = await listAttendance(user, studentId);

  const studentOptions = [
    ...new Map(
      attendance.map((item) => [
        item.student.id,
        {
          id: item.student.id,
          label: `${item.student.user.firstName} ${item.student.user.lastName}`,
        },
      ]),
    ).values(),
  ];

  const entryOptions = [
    ...new Map(
      attendance.map((item) => [
        item.timetableEntry.id,
        {
          id: item.timetableEntry.id,
          label: `${item.timetableEntry.subject.name} | ${item.timetableEntry.schoolClass.name} | ${item.timetableEntry.startTime}`,
        },
      ]),
    ).values(),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Attendance"
        description="See presence patterns, mark attendance quickly, and track reasons and notes by lesson."
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

      {(user.role === Role.TEACHER || user.role === Role.ADMIN) ? (
        <AttendanceForm students={studentOptions} entries={entryOptions} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Attendance register</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Lesson</TH>
                <TH>Date</TH>
                <TH>Status</TH>
                <TH>Reason</TH>
              </TR>
            </THead>
            <TBody>
              {attendance.map((item) => (
                <TR key={item.id}>
                  <TD>{item.student.user.firstName} {item.student.user.lastName}</TD>
                  <TD>{item.timetableEntry.subject.name}</TD>
                  <TD>{formatDate(item.date)}</TD>
                  <TD>
                    <Badge
                      variant={
                        item.status === "PRESENT"
                          ? "success"
                          : item.status === "LATE"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TD>
                  <TD>{item.reason || "-"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
