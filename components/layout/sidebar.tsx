"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, School, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Role } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/lib/navigation";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";

const navGroups = [
  { key: "main", label: "Workspace" },
  { key: "admin", label: "Administration" },
  { key: "system", label: "Account" },
] as const;

function SidebarContent({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setMobileNavOpen } = useAppStore();

  return (
    <div className={cn("flex h-full flex-col text-slate-100", sidebarCollapsed ? "px-3" : "px-4")}>
      <div className="border-b border-white/10 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-white">
            <School className="h-6 w-6" />
          </div>
          {!sidebarCollapsed ? (
            <div>
              <p className="text-lg font-bold text-white">Aqtas Diary</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">AI-first school OS</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="mt-4 inline-flex rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-3xl bg-white/8 p-3">
        <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} className="h-12 w-12" />
        {!sidebarCollapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-300">{user.role}</p>
          </div>
        ) : null}
      </div>

      <div className="scrollbar-thin mt-6 flex-1 space-y-6 overflow-y-auto pb-6">
        {navGroups.map((group) => {
          const items = navigationItems.filter(
            (item) => item.group === group.key && item.roles.includes(user.role as Role),
          );
          if (!items.length) return null;

          return (
            <div key={group.key}>
              {!sidebarCollapsed ? (
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {group.label}
                </p>
              ) : null}
              <div className="mt-3 space-y-1">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-white/16 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "text-slate-200 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!sidebarCollapsed ? <span>{item.label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 rounded-3xl border border-white/10 bg-white/6 p-4">
        {!sidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              AI grounded mode
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Summaries, risk alerts, and drafts are generated from live school records only.
            </p>
          </>
        ) : (
          <Sparkles className="mx-auto h-5 w-5 text-cyan-300" />
        )}
      </div>

      <form action="/api/auth/logout" method="post" className="pb-6">
        <Button type="submit" variant="ghost" className="w-full justify-start text-slate-100 hover:bg-white/10 hover:text-white">
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed ? "Logout" : null}
        </Button>
      </form>
    </div>
  );
}

export function Sidebar({ user }: { user: SessionUser }) {
  const { mobileNavOpen, setMobileNavOpen } = useAppStore();

  return (
    <>
      <aside className="hidden h-screen w-[290px] shrink-0 border-r border-white/5 bg-[var(--sidebar)] lg:block">
        <SidebarContent user={user} />
      </aside>

      <AnimatePresence>
        {mobileNavOpen ? (
          <>
            <motion.button
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[290px] border-r border-white/5 bg-[var(--sidebar)] lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", bounce: 0, duration: 0.32 }}
            >
              <SidebarContent user={user} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
