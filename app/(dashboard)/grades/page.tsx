import { Role } from "@prisma/client";
import { ChildSwitcher } from "@/components/forms/child-switcher";
import { DeleteButton } from "@/components/forms/delete-button";
import { GradeForm } from "@/components/forms/grade-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireSession } from "@/lib/auth/session";
import { getRoleContext } from "@/lib/context";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { listGrades } from "@/features/grades/service";
import { listStudents } from "@/features/students/service";

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await requireSession();
  const { studentId } = await searchParams;
  const context = await getRoleContext(user);
  const grades = await listGrades(user, studentId);
  const availableStudents =
    user.role === Role.TEACHER || user.role === Role.ADMIN ? await listStudents(user) : [];
  const availableSubjects =
    user.role === Role.ADMIN
      ? await db.subject.findMany({ orderBy: { name: "asc" } })
      : [...new Map((context.teacher?.assignments ?? []).map((item) => [item.subject.id, item.subject])).values()];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Grades"
        description="Review, edit, and track weighted assessment history with a more normal school gradebook workflow."
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
        <GradeForm
          students={availableStudents.map((student) => ({
            id: student.id,
            label: `${student.user.firstName} ${student.user.lastName}${student.schoolClass ? ` - ${student.schoolClass.name}` : ""}`,
          }))}
          subjects={availableSubjects.map((subject) => ({ id: subject.id, name: subject.name }))}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Gradebook</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Subject</TH>
                <TH>Type</TH>
                <TH>Value</TH>
                <TH>Weight</TH>
                <TH>Date</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {grades.map((grade) => (
                <TR key={grade.id}>
                  <TD>{grade.student.user.firstName} {grade.student.user.lastName}</TD>
                  <TD>{grade.subject.name}</TD>
                  <TD>{grade.type}</TD>
                  <TD className="font-semibold text-[var(--primary)]">{grade.value}</TD>
                  <TD>{grade.weight}</TD>
                  <TD>{formatDate(grade.dateAssigned)}</TD>
                  <TD>
                    {(user.role === Role.TEACHER || user.role === Role.ADMIN) ? (
                      <DeleteButton endpoint={`/api/grades/${grade.id}`} label="Grade" />
                    ) : null}
                  </TD>
                </TR>
              ))}
              {(user.role === Role.TEACHER || user.role === Role.ADMIN) ? (
                grades.map((grade) => (
                  <TR key={`${grade.id}-editor`} className="bg-slate-50/80">
                    <TD colSpan={7}>
                      <details className="rounded-2xl border bg-white p-4">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                          Edit {grade.student.user.firstName} {grade.student.user.lastName} - {grade.subject.name}
                        </summary>
                        <div className="mt-4">
                          <GradeForm
                            students={[
                              {
                                id: grade.student.id,
                                label: `${grade.student.user.firstName} ${grade.student.user.lastName}`,
                              },
                            ]}
                            subjects={[
                              {
                                id: grade.subject.id,
                                name: grade.subject.name,
                              },
                            ]}
                            endpoint={`/api/grades/${grade.id}`}
                            method="PATCH"
                            title="Update grade"
                            submitLabel="Save grade"
                            lockScope
                            initialValues={{
                              studentId: grade.student.id,
                              subjectId: grade.subject.id,
                              value: grade.value,
                              weight: grade.weight,
                              type: grade.type,
                              comment: grade.comment ?? "",
                              dateAssigned: new Date(grade.dateAssigned).toISOString().slice(0, 16),
                            }}
                          />
                        </div>
                      </details>
                    </TD>
                  </TR>
                ))
              ) : null}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
