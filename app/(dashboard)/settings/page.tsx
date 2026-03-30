import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireSession();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Basic account and workspace information for the signed-in user."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Name</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{user.fullName}</p>
          </div>
          <div className="rounded-2xl border bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Email</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{user.email}</p>
          </div>
          <div className="rounded-2xl border bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Role</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{user.role}</p>
          </div>
          <div className="rounded-2xl border bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Session</p>
            <p className="mt-2 text-sm text-[var(--muted)]">JWT cookie based session with backend RBAC checks.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
