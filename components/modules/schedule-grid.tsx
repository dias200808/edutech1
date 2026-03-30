import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weekDays = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function ScheduleGrid({
  entries,
}: {
  entries: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
    subject: { name: string; color: string };
    schoolClass: { name: string };
    teacher: { user: { firstName: string; lastName: string } };
  }>;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {weekDays.map((day) => {
        const dayEntries = entries.filter((entry) => entry.dayOfWeek === day.value);
        return (
          <Card key={day.value} className="xl:col-span-1">
            <CardHeader>
              <CardTitle>{day.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayEntries.length ? (
                dayEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.subject.color }} />
                        <p className="font-semibold">{entry.subject.name}</p>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{entry.room}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {entry.startTime} - {entry.endTime}
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {entry.schoolClass.name} • {entry.teacher.user.firstName} {entry.teacher.user.lastName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">No lessons scheduled.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
