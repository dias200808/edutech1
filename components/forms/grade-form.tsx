"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GradeType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { gradeSchema } from "@/lib/validators";

type FormValues = z.input<typeof gradeSchema>;

export function GradeForm({
  students,
  subjects,
  endpoint = "/api/grades",
  method = "POST",
  title = "Add grade",
  submitLabel,
  initialValues,
  lockScope = false,
}: {
  students: Array<{ id: string; label: string }>;
  subjects: Array<{ id: string; name: string }>;
  endpoint?: string;
  method?: "POST" | "PATCH";
  title?: string;
  submitLabel?: string;
  initialValues?: Partial<FormValues>;
  lockScope?: boolean;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      studentId: initialValues?.studentId ?? students[0]?.id ?? "",
      subjectId: initialValues?.subjectId ?? subjects[0]?.id ?? "",
      value: initialValues?.value ?? 85,
      weight: initialValues?.weight ?? 1,
      type: initialValues?.type ?? GradeType.TEST,
      comment: initialValues?.comment ?? "",
      dateAssigned: initialValues?.dateAssigned ?? new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, dateAssigned: new Date(values.dateAssigned).toISOString() }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || `Unable to ${method === "PATCH" ? "update" : "add"} grade`);
      return;
    }
    toast.success(method === "PATCH" ? "Grade updated" : "Grade saved");
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select {...form.register("studentId")}>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select {...form.register("subjectId")}>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Value</Label>
              <Input type="number" {...form.register("value", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input type="number" step="0.1" {...form.register("weight", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select {...form.register("type")}>
                {Object.values(GradeType).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date assigned</Label>
            <Input type="datetime-local" {...form.register("dateAssigned")} />
          </div>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Input {...form.register("comment")} placeholder="Strong progress on algebraic reasoning" />
          </div>
          {lockScope ? <p className="text-xs font-medium text-[var(--muted)]">Student and subject scope are locked for this edit.</p> : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel ?? (method === "PATCH" ? "Save changes" : "Save grade")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
