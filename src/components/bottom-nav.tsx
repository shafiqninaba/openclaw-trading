"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  BookOpen,
  Eye,
  GraduationCap,
  Info,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const primaryTabs: Tab[] = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/trades", label: "Trades", icon: ArrowLeftRight },
];

const moreTabs: Tab[] = [
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/about", label: "About", icon: Info },
];

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const moreIsActive = moreTabs.some((t) => isActive(t.href, pathname));

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {primaryTabs.map((tab) => {
          const active = isActive(tab.href, pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              <span className="hidden xs:inline">{tab.label}</span>
            </Link>
          );
        })}

        {/* More button + popup */}
        <div ref={menuRef} className="relative flex flex-1 flex-col items-center">
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
              moreIsActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal
              className="h-5 w-5"
              strokeWidth={moreIsActive ? 2.25 : 1.75}
            />
            <span className="hidden xs:inline">More</span>
          </button>

          {open && (
            <div className="absolute bottom-full right-0 mb-2 min-w-[160px] rounded-xl border border-border bg-background p-1.5 shadow-lg">
              {moreTabs.map((tab) => {
                const active = isActive(tab.href, pathname);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.25 : 1.75} />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
