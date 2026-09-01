"use client";

import { useState } from "react";

interface ImportResult {
  inserted?: number;
  updated?: number;
  created?: number;
  unmatched?: string[];
  error?: string;
}

export function ImportForm() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
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
          <label className="mb-1 block text-sm font-medium text-slate-700">ไฟล์ CSV</label>
          <input type="file" name="file" accept=".csv" required className="text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ฐานข้อมูล</label>
          <select name="source_db" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
            <option value="tci">TCI</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="auto_create" />
          สร้างคณาจารย์ใหม่อัตโนมัติถ้าไม่พบชื่อในระบบ (ใช้เมื่อเพิ่มอาจารย์ที่ยังไม่มีในระบบเลย)
        </label>
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
            <>
              <p className="text-green-700">
                เพิ่มใหม่ {result.inserted} รายการ · อัปเดตของเดิม {result.updated} รายการ
                {result.created ? ` · สร้างคณาจารย์ใหม่ ${result.created} คน` : ""}
              </p>
              {result.unmatched && result.unmatched.length > 0 && (
                <div className="mt-3">
                  <p className="text-amber-700">
                    จับคู่ชื่อผู้แต่งกับรายชื่อคณาจารย์ไม่สำเร็จ {result.unmatched.length} รายการ
                    (ติ๊ก &quot;สร้างคณาจารย์ใหม่อัตโนมัติ&quot; แล้วนำเข้าใหม่ ถ้าเป็นอาจารย์ที่ยังไม่มีในระบบ):
                  </p>
                  <ul className="mt-1 list-inside list-disc text-slate-600">
                    {result.unmatched.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
