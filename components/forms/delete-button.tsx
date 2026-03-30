"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  endpoint,
  label = "Delete",
}: {
  endpoint: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        if (!window.confirm(`Delete ${label.toLowerCase()}?`)) return;

        const response = await fetch(endpoint, { method: "DELETE" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          toast.error(result.error || `Unable to delete ${label.toLowerCase()}`);
          return;
        }

        toast.success(`${label} deleted`);
        router.refresh();
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
