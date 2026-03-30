"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

type StudentOption = {
  id: string;
  label: string;
  currentClass?: string | null;
};

type ClassCard = {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  students: Array<{ id: string; label: string }>;
};

export function ClassRosterManager({
  classes,
  students,
}: {
  classes: ClassCard[];
  students: StudentOption[];
}) {
  const router = useRouter();
  const [selectedByClass, setSelectedByClass] = useState<Record<string, string>>(
    Object.fromEntries(classes.map((item) => [item.id, students[0]?.id ?? ""])),
  );
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function assignStudent(classId: string) {
    const studentId = selectedByClass[classId];
    if (!studentId) {
      toast.error("Select a student first");
      return;
    }

    setLoadingKey(`assign-${classId}`);
    const response = await fetch(`/api/classes/${classId}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, studentId }),
    });
    const result = await response.json();
    setLoadingKey(null);

    if (!response.ok) {
      toast.error(result.error || "Unable to assign student");
      return;
    }

    toast.success("Class roster updated");
    router.refresh();
  }

  async function removeStudent(classId: string, studentId: string) {
    setLoadingKey(`remove-${studentId}`);
    const response = await fetch(`/api/classes/${classId}/students`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    const result = await response.json();
    setLoadingKey(null);

    if (!response.ok) {
      toast.error(result.error || "Unable to remove student");
      return;
    }

    toast.success("Student removed from class");
    router.refresh();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {classes.map((schoolClass) => (
        <Card key={schoolClass.id}>
          <CardHeader>
            <CardTitle>{schoolClass.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Grade {schoolClass.gradeLevel} | {schoolClass.academicYear}
            </p>

            <div className="rounded-2xl border bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-900">Add or move student</p>
              <div className="mt-3 space-y-3">
                <Select
                  value={selectedByClass[schoolClass.id] ?? ""}
                  onChange={(event) =>
                    setSelectedByClass((current) => ({
                      ...current,
                      [schoolClass.id]: event.target.value,
                    }))
                  }
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.label}{student.currentClass ? ` (${student.currentClass})` : ""}
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  className="w-full"
                  disabled={loadingKey === `assign-${schoolClass.id}`}
                  onClick={() => assignStudent(schoolClass.id)}
                >
                  {loadingKey === `assign-${schoolClass.id}` ? "Saving..." : "Add to class"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Current students</p>
              {schoolClass.students.length ? (
                schoolClass.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-white/85 p-3">
                    <p className="text-sm font-medium text-slate-800">{student.label}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loadingKey === `remove-${student.id}`}
                      onClick={() => removeStudent(schoolClass.id, student.id)}
                    >
                      {loadingKey === `remove-${student.id}` ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">No students assigned yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
