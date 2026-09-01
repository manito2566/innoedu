"use client";

import { useState } from "react";
import type { Researcher } from "@/types";

interface Result {
  inserted?: number;
  updated?: number;
  total?: number;
  error?: string;
}

export function ScholarImportForm({ researchers }: { researchers: Researcher[] }) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/admin/import-scholar", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">คณาจารย์เจ้าของผลงาน *</label>
          <select
            name="researcher_id"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              — เลือกคณาจารย์ —
            </option>
            {researchers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name_th} ({r.department})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ไฟล์ CSV จาก Publish or Perish (ผลการค้นของอาจารย์คนนี้เท่านั้น)
          </label>
          <input type="file" name="file" accept=".csv" required className="text-sm" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "กำลังนำเข้า..." : "นำเข้าไฟล์"}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <p className="text-green-700">
              พบทั้งหมด {result.total} รายการ — เพิ่มใหม่ {result.inserted} รายการ · อัปเดตของเดิม {result.updated} รายการ
            </p>
          )}
        </div>
      )}
    </div>
  );
}
