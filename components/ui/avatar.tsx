import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, initials } from "@/lib/utils";

export function Avatar({
  firstName,
  lastName,
  src,
  className,
}: {
  firstName?: string | null;
  lastName?: string | null;
  src?: string | null;
  className?: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn("flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-200", className)}
    >
      {src ? <AvatarPrimitive.Image className="h-full w-full object-cover" src={src} alt="" /> : null}
      <AvatarPrimitive.Fallback className="text-sm font-semibold text-slate-700">
        {initials(firstName, lastName)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
