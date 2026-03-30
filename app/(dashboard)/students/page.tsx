import { Role } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { getAdminCollections } from "@/features/admin/service";

export default async function StudentsPage() {
  const user = await requireRole([Role.ADMIN]);
  const data = await getAdminCollections(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Students" description="Review enrolled students, classes, and linked family relationships." />
      <Card>
        <CardHeader>
          <CardTitle>Student directory</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Class</TH>
                <TH>Code</TH>
              </TR>
            </THead>
            <TBody>
              {data.students.map((student) => (
                <TR key={student.id}>
                  <TD>{student.user.firstName} {student.user.lastName}</TD>
                  <TD>{student.schoolClass?.name || "-"}</TD>
                  <TD>{student.studentCode}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
