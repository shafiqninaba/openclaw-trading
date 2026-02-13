"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/sidebar-provider";
import { primaryTabs, secondaryTabs } from "@/lib/navigation";

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:border-r lg:border-border lg:bg-background transition-[width] duration-200",
        collapsed ? "lg:w-16" : "lg:w-60"
      )}
    >
      <div className={cn(
        "flex h-14 items-center border-b border-border",
        collapsed ? "justify-center px-2" : "justify-between px-5"
      )}>
        {!collapsed && <h1 className="text-lg font-semibold">Awkclaw 🐢</h1>}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className={cn(
        "flex-1 overflow-y-auto py-4 space-y-1",
        collapsed ? "px-2" : "px-3"
      )}>
        {primaryTabs.map((tab) => {
          const active = isActive(tab.href, pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={collapsed ? tab.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed
                  ? "justify-center px-0 py-2.5"
                  : "gap-3 px-3 py-2.5",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              {!collapsed && tab.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border" />

        {secondaryTabs.map((tab) => {
          const active = isActive(tab.href, pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              title={collapsed ? tab.label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed
                  ? "justify-center px-0 py-2.5"
                  : "gap-3 px-3 py-2.5",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              {!collapsed && tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
