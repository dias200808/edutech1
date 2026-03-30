"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AttendanceStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { attendanceSchema } from "@/lib/validators";

type FormValues = z.input<typeof attendanceSchema>;

export function AttendanceForm({
  students,
  entries,
}: {
  students: Array<{ id: string; label: string }>;
  entries: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      studentId: students[0]?.id ?? "",
      timetableEntryId: entries[0]?.id ?? "",
      date: new Date().toISOString().slice(0, 16),
      status: AttendanceStatus.PRESENT,
      reason: "",
      note: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, date: new Date(values.date).toISOString() }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Unable to mark attendance");
      return;
    }
    toast.success("Attendance saved");
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark attendance</CardTitle>
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
              <Label>Lesson</Label>
              <Select {...form.register("timetableEntryId")}>
                {entries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="datetime-local" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select {...form.register("status")}>
                {Object.values(AttendanceStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input {...form.register("reason")} placeholder="Medical appointment" />
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <Input {...form.register("note")} placeholder="Arrived after the first 15 minutes" />
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save attendance"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
