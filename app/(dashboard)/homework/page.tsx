import { Role } from "@prisma/client";
import { ChildSwitcher } from "@/components/forms/child-switcher";
import { DeleteButton } from "@/components/forms/delete-button";
import { HomeworkForm } from "@/components/forms/homework-form";
import { HomeworkSubmissionForm } from "@/components/forms/homework-submission-form";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { getRoleContext } from "@/lib/context";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { listHomework } from "@/features/homework/service";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const user = await requireSession();
  const { studentId } = await searchParams;
  const context = await getRoleContext(user);
  const homework = await listHomework(user, studentId);

  const classes =
    user.role === Role.ADMIN
      ? await db.schoolClass.findMany({ orderBy: { name: "asc" } })
      : [...new Map((context.teacher?.assignments ?? []).map((item) => [item.schoolClass.id, item.schoolClass])).values()];
  const subjects =
    user.role === Role.ADMIN
      ? await db.subject.findMany({ orderBy: { name: "asc" } })
      : [...new Map((context.teacher?.assignments ?? []).map((item) => [item.subject.id, item.subject])).values()];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Homework"
        description="Track assigned work, share materials, review submissions, and keep class workload clear in one space."
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

      {(user.role === Role.TEACHER || user.role === Role.ADMIN) && classes.length && subjects.length ? (
        <HomeworkForm
          classes={classes.map((entry) => ({ id: entry.id, name: entry.name }))}
          subjects={subjects.map((entry) => ({ id: entry.id, name: entry.name }))}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {homework.map((item) => {
          const submission = item.submissions[0];
          const overdue = new Date(item.dueDate) < new Date();
          const submittedCount = item.submissions.filter(
            (entry) => entry.status === "SUBMITTED" || entry.status === "REVIEWED",
          ).length;
          const pendingCount = item.submissions.filter((entry) => entry.status === "NOT_SUBMITTED").length;
          const sharedMaterial = item.attachments[0];

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {item.subject.name} | {item.schoolClass.name} | Due {formatDate(item.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={overdue ? "danger" : "info"}>{overdue ? "Overdue" : "Active"}</Badge>
                    {user.role === Role.TEACHER || user.role === Role.ADMIN ? (
                      <DeleteButton endpoint={`/api/homework/${item.id}`} label="Homework" />
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-700">{item.description}</p>

                <div className="rounded-2xl border bg-slate-50/80 p-4 text-sm text-slate-700">
                  <p>
                    Teacher: {item.teacher.user.firstName} {item.teacher.user.lastName}
                  </p>
                  {sharedMaterial ? (
                    <p className="mt-2">
                      Shared material:{" "}
                      <a
                        href={sharedMaterial.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[var(--primary)] underline underline-offset-4"
                      >
                        {sharedMaterial.fileName}
                      </a>
                    </p>
                  ) : null}
                </div>

                {user.role === Role.TEACHER || user.role === Role.ADMIN ? (
                  <div className="rounded-2xl border bg-white/85 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="success">Submitted: {submittedCount}</Badge>
                      <Badge variant="warning">Pending: {pendingCount}</Badge>
                    </div>
                    <div className="mt-4 space-y-3">
                      {item.submissions.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="rounded-2xl border bg-slate-50/70 p-3">
                          <p className="font-semibold text-slate-900">
                            {entry.student.user.firstName} {entry.student.user.lastName}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                            {entry.status}
                          </p>
                          {entry.content ? <p className="mt-2 text-sm text-slate-700">{entry.content}</p> : null}
                          {entry.attachmentUrl ? (
                            <a
                              href={entry.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex text-sm font-semibold text-[var(--primary)] underline underline-offset-4"
                            >
                              Open student attachment
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {user.role === Role.STUDENT ? <HomeworkSubmissionForm homeworkId={item.id} /> : null}

                {submission ? (
                  <div className="rounded-2xl border bg-emerald-50/70 p-4">
                    <p className="text-sm font-semibold text-emerald-900">Submission status: {submission.status}</p>
                    {submission.content ? <p className="mt-2 text-sm text-emerald-900/80">{submission.content}</p> : null}
                    {submission.attachmentUrl ? (
                      <a
                        href={submission.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-semibold text-emerald-900 underline underline-offset-4"
                      >
                        Open my attachment
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {user.role === Role.TEACHER || user.role === Role.ADMIN ? (
                  <details className="rounded-2xl border bg-white/85 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-900">Edit homework</summary>
                    <div className="mt-4">
                      <HomeworkForm
                        classes={classes.map((entry) => ({ id: entry.id, name: entry.name }))}
                        subjects={subjects.map((entry) => ({ id: entry.id, name: entry.name }))}
                        endpoint={`/api/homework/${item.id}`}
                        method="PATCH"
                        title="Update homework"
                        submitLabel="Save homework"
                        initialValues={{
                          classId: item.classId,
                          subjectId: item.subjectId,
                          title: item.title,
                          description: item.description,
                          dueDate: new Date(item.dueDate).toISOString().slice(0, 16),
                          attachmentName: item.attachments[0]?.fileName ?? "",
                          attachmentUrl: item.attachments[0]?.fileUrl ?? "",
                        }}
                      />
                    </div>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
