import type { ComponentType } from "react";
import {
  BellRing,
  BookCheck,
  Bot,
  CalendarDays,
  ChartColumnBig,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  NotebookPen,
  School,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { Role } from "@prisma/client";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
  group: "main" | "admin" | "system";
};

export const navigationItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/homework", label: "Homework", icon: NotebookPen, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/grades", label: "Grades", icon: GraduationCap, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/attendance", label: "Attendance", icon: BookCheck, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/messages", label: "Messages", icon: MessageSquareText, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/announcements", label: "Announcements", icon: BellRing, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/ai", label: "AI Assistant", icon: Bot, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/reports", label: "Reports", icon: ClipboardList, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "main" },
  { href: "/users", label: "Users", icon: Users, roles: [Role.ADMIN], group: "admin" },
  { href: "/students", label: "Students", icon: School, roles: [Role.ADMIN], group: "admin" },
  { href: "/parents", label: "Parents", icon: Users, roles: [Role.ADMIN], group: "admin" },
  { href: "/teachers", label: "Teachers", icon: Users, roles: [Role.ADMIN], group: "admin" },
  { href: "/classes", label: "Classes", icon: School, roles: [Role.ADMIN], group: "admin" },
  { href: "/subjects", label: "Subjects", icon: GraduationCap, roles: [Role.ADMIN], group: "admin" },
  { href: "/timetable", label: "Timetable", icon: CalendarDays, roles: [Role.ADMIN], group: "admin" },
  { href: "/analytics", label: "Analytics", icon: ChartColumnBig, roles: [Role.ADMIN], group: "admin" },
  { href: "/settings", label: "Settings", icon: Settings, roles: [Role.ADMIN, Role.TEACHER, Role.PARENT, Role.STUDENT], group: "system" },
  { href: "/system-settings", label: "System Settings", icon: Shield, roles: [Role.ADMIN], group: "system" },
];
