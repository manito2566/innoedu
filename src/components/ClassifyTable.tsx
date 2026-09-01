"use client";

import { useState, useTransition } from "react";
import { CATEGORIES, LEVELS } from "@/lib/taxonomy";
import type { InnovationCategory, InnovationLevel, Publication } from "@/types";

export interface ClassifyRow extends Publication {
  researcher_name: string;
}

export function ClassifyTable({ rows: initialRows }: { rows: ClassifyRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateLocal(id: string, patch: Partial<ClassifyRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: ClassifyRow) {
    setPendingId(row.id);
    try {
      const res = await fetch("/api/admin/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          innovation_category: row.innovation_category,
          innovation_level: row.innovation_level,
          classification_note: row.classification_note,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      const { status } = await res.json();
      startTransition(() => {
        if (status === "confirmed") {
          setRows((prev) => prev.filter((r) => r.id !== row.id));
        } else {
          updateLocal(row.id, { classification_status: status });
        }
      });
    } finally {
      setPendingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
        ไม่มีบทความที่รอการยืนยันประเภทนวัตกรรมแล้ว 🎉
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">ชื่อเรื่อง / ผู้วิจัย</th>
            <th className="px-4 py-3">ประเภทนวัตกรรม</th>
            <th className="px-4 py-3">ระดับการเปลี่ยนแปลง</th>
            <th className="px-4 py-3">หมายเหตุ</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="align-top">
              <td className="max-w-sm px-4 py-3">
                <p className="font-medium text-slate-800">{row.title}</p>
                <p className="text-xs text-slate-400">
                  {row.researcher_name} · {row.year ?? "—"} · {row.source_title}
                </p>
              </td>
              <td className="px-4 py-3">
                <select
                  className="w-56 rounded-md border border-slate-300 px-2 py-1.5"
                  value={row.innovation_category ?? ""}
                  onChange={(e) =>
                    updateLocal(row.id, {
                      innovation_category: (e.target.value || null) as InnovationCategory | null,
                    })
                  }
                >
                  <option value="">— เลือกประเภท —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_th}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <select
                  className="w-56 rounded-md border border-slate-300 px-2 py-1.5"
                  value={row.innovation_level ?? ""}
                  onChange={(e) =>
                    updateLocal(row.id, {
                      innovation_level: (e.target.value || null) as InnovationLevel | null,
                    })
                  }
                >
                  <option value="">— เลือกระดับ —</option>
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name_th}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  className="w-40 rounded-md border border-slate-300 px-2 py-1.5"
                  value={row.classification_note}
                  onChange={(e) => updateLocal(row.id, { classification_note: e.target.value })}
                  placeholder="เหตุผล (ถ้ามี)"
                />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => save(row)}
                  disabled={pendingId === row.id || isPending || !row.innovation_category || !row.innovation_level}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  ยืนยัน
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
