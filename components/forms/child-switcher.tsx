"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

export function ChildSwitcher({
  options,
}: {
  options: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("studentId") ?? options[0]?.id ?? "";

  return (
    <Select
      value={current}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams);
        params.set("studentId", event.target.value);
        router.push(`?${params.toString()}`);
      }}
      className="min-w-[220px]"
    >
      {options.map((child) => (
        <option key={child.id} value={child.id}>
          {child.label}
        </option>
      ))}
    </Select>
  );
}
