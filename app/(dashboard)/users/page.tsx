import { Role } from "@prisma/client";
import { UserForm } from "@/components/forms/user-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/features/admin/service";

export default async function UsersPage() {
  const user = await requireRole([Role.ADMIN]);
  const users = await listUsers(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Manage accounts across the school platform with role-aware provisioning." />
      <UserForm />
      <Card>
        <CardHeader>
          <CardTitle>All users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {users.map((record) => (
                <TR key={record.id}>
                  <TD>{record.firstName} {record.lastName}</TD>
                  <TD>{record.email}</TD>
                  <TD>{record.role}</TD>
                  <TD>{record.isActive ? "Active" : "Disabled"}</TD>
                  <TD><DeleteButton endpoint={`/api/users/${record.id}`} label="User" /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
