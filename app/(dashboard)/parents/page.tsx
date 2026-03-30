import { Role } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { getAdminCollections } from "@/features/admin/service";

export default async function ParentsPage() {
  const user = await requireRole([Role.ADMIN]);
  const data = await getAdminCollections(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Parents" description="See family accounts and how they link to student records." />
      <Card>
        <CardHeader>
          <CardTitle>Parent directory</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Linked students</TH>
              </TR>
            </THead>
            <TBody>
              {data.parents.map((parent) => (
                <TR key={parent.id}>
                  <TD>{parent.user.firstName} {parent.user.lastName}</TD>
                  <TD>{parent.user.email}</TD>
                  <TD>{parent.children.length}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
