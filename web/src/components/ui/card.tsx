import type { ReactNode } from "react";
import { cardClass } from "@/lib/ui";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${cardClass} ${className ?? ""}`.trim()}>{children}</div>;
}
