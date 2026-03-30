"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function HomeworkSubmissionForm({ homeworkId }: { homeworkId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-3 rounded-2xl border bg-white/80 p-4">
      <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add your submission notes or answer..." />
      <Button
        type="button"
        disabled={submitting || !content.trim()}
        onClick={async () => {
          setSubmitting(true);
          const response = await fetch(`/api/homework/${homeworkId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
          const result = await response.json();
          setSubmitting(false);
          if (!response.ok) {
            toast.error(result.error || "Unable to submit homework");
            return;
          }
          toast.success("Homework submitted");
          setContent("");
          router.refresh();
        }}
      >
        {submitting ? "Submitting..." : "Submit homework"}
      </Button>
    </div>
  );
}
