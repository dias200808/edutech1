import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
