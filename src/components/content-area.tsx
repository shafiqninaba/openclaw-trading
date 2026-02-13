"use client";

import { useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";

export function ContentArea({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "transition-[padding-left] duration-200",
        collapsed ? "lg:pl-16" : "lg:pl-60"
      )}
    >
      {children}
    </div>
  );
}
