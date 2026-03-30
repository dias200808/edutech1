import { Role } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { getAdminCollections } from "@/features/admin/service";

export default async function TeachersPage() {
  const user = await requireRole([Role.ADMIN]);
  const data = await getAdminCollections(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Teachers" description="Monitor teacher accounts and assignment load across classes and subjects." />
      <Card>
        <CardHeader>
          <CardTitle>Teacher roster</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Employee code</TH>
                <TH>Assignments</TH>
              </TR>
            </THead>
            <TBody>
              {data.teachers.map((teacher) => (
                <TR key={teacher.id}>
                  <TD>{teacher.user.firstName} {teacher.user.lastName}</TD>
                  <TD>{teacher.employeeCode}</TD>
                  <TD>{teacher.assignments.length}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
