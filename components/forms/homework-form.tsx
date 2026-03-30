"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { homeworkSchema } from "@/lib/validators";

type FormValues = z.input<typeof homeworkSchema>;

export function HomeworkForm({
  classes,
  subjects,
  endpoint = "/api/homework",
  method = "POST",
  submitLabel,
  title = "Assign homework",
  initialValues,
  compact = false,
}: {
  classes: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
  endpoint?: string;
  method?: "POST" | "PATCH";
  submitLabel?: string;
  title?: string;
  initialValues?: Partial<FormValues>;
  compact?: boolean;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      classId: initialValues?.classId ?? classes[0]?.id ?? "",
      subjectId: initialValues?.subjectId ?? subjects[0]?.id ?? "",
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      dueDate: initialValues?.dueDate ?? new Date().toISOString().slice(0, 16),
      attachmentName: initialValues?.attachmentName ?? "",
      attachmentUrl: initialValues?.attachmentUrl ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, dueDate: new Date(values.dueDate).toISOString() }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || `Unable to ${method === "PATCH" ? "update" : "create"} homework`);
      return;
    }
    toast.success(method === "PATCH" ? "Homework updated" : "Homework created");
    if (method === "POST") {
      form.reset({
        classId: classes[0]?.id ?? "",
        subjectId: subjects[0]?.id ?? "",
        title: "",
        description: "",
        dueDate: new Date().toISOString().slice(0, 16),
        attachmentName: "",
        attachmentUrl: "",
      });
    }
    router.refresh();
  });

  const content = (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select {...form.register("classId")}>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select {...form.register("subjectId")}>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} placeholder="Quadratic equations practice" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} placeholder="Describe the assignment and expected output..." />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="datetime-local" {...form.register("dueDate")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Resource title</Label>
              <Input {...form.register("attachmentName")} placeholder="Worksheet PDF" />
            </div>
            <div className="space-y-2">
              <Label>File or link URL</Label>
              <Input {...form.register("attachmentUrl")} placeholder="https://..." />
            </div>
          </div>
          <p className="text-xs leading-5 text-[var(--muted)]">
            Teachers can share a Google Drive link, cloud file, or any direct resource URL together with the homework.
          </p>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : submitLabel ?? (method === "PATCH" ? "Save changes" : "Create homework")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  if (compact) {
    return <div className="rounded-2xl border bg-white/80">{content}</div>;
  }

  return content;
}
