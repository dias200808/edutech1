import { Role } from "@prisma/client";
import { ClassRosterManager } from "@/components/forms/class-roster-manager";
import { PageHeader } from "@/components/shared/page-header";
import { requireRole } from "@/lib/auth/session";
import { getAdminCollections } from "@/features/admin/service";

export default async function ClassesPage() {
  const user = await requireRole([Role.ADMIN]);
  const data = await getAdminCollections(user);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Classes"
        description="Manage class composition by moving students in and out of classes and reviewing current rosters."
      />
      <ClassRosterManager
        classes={data.classes.map((item) => ({
          id: item.id,
          name: item.name,
          gradeLevel: item.gradeLevel,
          academicYear: item.academicYear,
          students: item.students.map((student) => ({
            id: student.id,
            label: `${student.user.firstName} ${student.user.lastName}`,
          })),
        }))}
        students={data.students.map((student) => ({
          id: student.id,
          label: `${student.user.firstName} ${student.user.lastName}`,
          currentClass: student.schoolClass?.name ?? null,
        }))}
      />
    </div>
  );
}
