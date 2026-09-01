import { getCategory, getLevel } from "@/lib/taxonomy";
import type { ClassificationStatus, InnovationCategory, InnovationLevel } from "@/types";

export function StatusBadge({ status }: { status: ClassificationStatus }) {
  const styles: Record<ClassificationStatus, string> = {
    confirmed: "bg-green-100 text-green-700",
    suggested: "bg-amber-100 text-amber-700",
    unclassified: "bg-slate-100 text-slate-500",
  };
  const labels: Record<ClassificationStatus, string> = {
    confirmed: "ยืนยันแล้ว",
    suggested: "แนะนำอัตโนมัติ",
    unclassified: "ยังไม่จัดประเภท",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>{labels[status]}</span>;
}

export function CategoryBadge({ category }: { category: InnovationCategory | null }) {
  const c = getCategory(category);
  if (!c) return <span className="text-xs text-slate-400">—</span>;
  return <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{c.name_en}</span>;
}

export function LevelBadge({ level }: { level: InnovationLevel | null }) {
  const l = getLevel(level);
  if (!l) return <span className="text-xs text-slate-400">—</span>;
  return <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">{l.name_en}</span>;
}
