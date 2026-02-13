import {
  LayoutDashboard,
  ArrowLeftRight,
  BookOpen,
  Eye,
  GraduationCap,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const primaryTabs: NavTab[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/trades", label: "Trades", icon: ArrowLeftRight },
];

export const secondaryTabs: NavTab[] = [
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/about", label: "About", icon: Info },
];
