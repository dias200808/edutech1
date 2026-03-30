"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type TimetableOption = { id: string; name: string };
type TeacherOption = { id: string; name: string };
type TimetableEntryView = {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  room: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  schoolClass: { name: string };
  subject: { name: string };
  teacher: { user: { firstName: string; lastName: string } };
};

const dayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function TimetableEntryEditor({
  entry,
  classes,
  subjects,
  teachers,
}: {
  entry: TimetableEntryView;
  classes: TimetableOption[];
  subjects: TimetableOption[];
  teachers: TeacherOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    classId: entry.classId,
    subjectId: entry.subjectId,
    teacherId: entry.teacherId,
    room: entry.room,
    dayOfWeek: String(entry.dayOfWeek),
    startTime: entry.startTime,
    endTime: entry.endTime,
  });

  async function save() {
    setLoading(true);
    const response = await fetch(`/api/timetable/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dayOfWeek: Number(form.dayOfWeek),
      }),
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(result.error || "Unable to update timetable entry");
      return;
    }

    toast.success("Timetable updated");
    router.refresh();
  }

  async function remove() {
    setLoading(true);
    const response = await fetch(`/api/timetable/${entry.id}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      toast.error(result.error || "Unable to delete timetable entry");
      return;
    }

    toast.success("Timetable entry removed");
    router.refresh();
  }

  return (
    <details className="rounded-2xl border bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-900">
        {entry.schoolClass.name} | {entry.subject.name} | {entry.startTime}-{entry.endTime}
      </summary>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={form.classId} onChange={(event) => setForm((current) => ({ ...current, classId: event.target.value }))}>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Select value={form.subjectId} onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}>
            {subjects.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Teacher</Label>
          <Select value={form.teacherId} onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))}>
            {teachers.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Room</Label>
          <Input value={form.room} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Day</Label>
          <Select value={form.dayOfWeek} onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}>
            {dayOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Start time</Label>
          <Input value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>End time</Label>
          <Input value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Button type="button" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
        <Button type="button" variant="outline" onClick={remove} disabled={loading}>Delete</Button>
      </div>
    </details>
  );
}

export function TimetableManager({
  classes,
  subjects,
  teachers,
  entries,
}: {
  classes: TimetableOption[];
  subjects: TimetableOption[];
  teachers: TeacherOption[];
  entries: TimetableEntryView[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    classId: classes[0]?.id ?? "",
    subjectId: subjects[0]?.id ?? "",
    teacherId: teachers[0]?.id ?? "",
    room: "",
    dayOfWeek: "1",
    startTime: "08:30",
    endTime: "09:15",
  });

  async function createEntry() {
    setLoading(true);
    const response = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dayOfWeek: Number(form.dayOfWeek),
      }),
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(result.error || "Unable to create timetable entry");
      return;
    }

    toast.success("Timetable entry created");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage timetable</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={form.classId} onChange={(event) => setForm((current) => ({ ...current, classId: event.target.value }))}>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={form.subjectId} onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Teacher</Label>
            <Select value={form.teacherId} onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))}>
              {teachers.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Room</Label>
            <Input value={form.room} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} placeholder="204A" />
          </div>
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={form.dayOfWeek} onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}>
              {dayOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start time</Label>
            <Input value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} placeholder="08:30" />
          </div>
          <div className="space-y-2">
            <Label>End time</Label>
            <Input value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} placeholder="09:15" />
          </div>
          <div className="flex items-end">
            <Button type="button" className="w-full" disabled={loading} onClick={createEntry}>
              {loading ? "Saving..." : "Add lesson"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit lessons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry) => (
            <TimetableEntryEditor
              key={entry.id}
              entry={entry}
              classes={classes}
              subjects={subjects}
              teachers={teachers}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
