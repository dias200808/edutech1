import { Role } from "@prisma/client";
import { AnnouncementForm } from "@/components/forms/announcement-form";
import { ChildSwitcher } from "@/components/forms/child-switcher";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { getRoleContext } from "@/lib/context";
import { formatDateTime } from "@/lib/utils";
import { listAnnouncements } from "@/features/announcements/service";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await requireSession();
  const { studentId } = await searchParams;
  const context = await getRoleContext(user);
  const announcements = await listAnnouncements(user, studentId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Announcements"
        description="Broadcast important updates with role-aware targeting, pinned visibility, and class scoping."
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
        <AnnouncementForm
          classes={
            user.role === Role.TEACHER
              ? [...new Map((context.teacher?.assignments ?? []).map((item) => [item.schoolClass.id, { id: item.schoolClass.id, name: item.schoolClass.name }])).values()]
              : []
          }
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{announcement.title}</CardTitle>
                  <p className="mt-2 text-sm text-[var(--muted)]">{formatDateTime(announcement.createdAt)}</p>
                </div>
                {announcement.isPinned ? <Badge variant="info">Pinned</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-slate-700">{announcement.content}</p>
              <p className="text-sm text-[var(--muted)]">
                {announcement.targetRole} • {announcement.schoolClass?.name || "All classes"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
