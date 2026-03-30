"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnnouncementTargetRole } from "@prisma/client";
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
import { announcementSchema } from "@/lib/validators";

type FormValues = z.input<typeof announcementSchema>;

export function AnnouncementForm({
  classes,
}: {
  classes: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      targetRole: AnnouncementTargetRole.ALL,
      classId: "",
      isPinned: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, classId: values.classId || null }),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.error || "Unable to create announcement");
      return;
    }
    toast.success("Announcement published");
    form.reset();
    router.refresh();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish announcement</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} placeholder="Parent conference next Thursday" />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea {...form.register("content")} placeholder="Share the key details and next steps..." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Target role</Label>
              <Select {...form.register("targetRole")}>
                {Object.values(AnnouncementTargetRole).map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select {...form.register("classId")}>
                <option value="">All classes</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" {...form.register("isPinned")} />
            Pin this announcement
          </label>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
