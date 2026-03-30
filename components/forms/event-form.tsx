"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { eventSchema } from "@/lib/validators";

type FormValues = z.input<typeof eventSchema>;

export function EventForm({
  classes,
}: {
  classes: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [defaults] = useState(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      startAt: start.toISOString().slice(0, 16),
      endAt: end.toISOString().slice(0, 16),
    };
  });
  const form = useForm<FormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startAt: defaults.startAt,
      endAt: defaults.endAt,
      type: EventType.SCHOOL,
      classId: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        classId: values.classId || null,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Unable to create event");
      return;
    }
    toast.success("Event created");
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create event</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} placeholder="Math exam week" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} placeholder="Add details for students and parents..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="datetime-local" {...form.register("startAt")} />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="datetime-local" {...form.register("endAt")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select {...form.register("type")}>
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select {...form.register("classId")}>
                <option value="">Whole school</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
