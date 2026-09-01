"use client";

import { useState } from "react";

interface Result {
  researchersUpserted?: number;
  newPubs?: number;
  updatedPubs?: number;
  unmatched?: string[];
  error?: string;
}

export function ScopusImportForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/admin/import-scopus", { method: "POST", body: formData });
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
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ไฟล์รายชื่อคณาจารย์ (researchers_filtered_*.csv) — ไม่บังคับ ใส่เมื่อต้องการอัปเดตจำนวนผลงาน/citation ของทุกคน
          </label>
          <input type="file" name="roster" accept=".csv" className="text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ไฟล์รายบทความต่อคน (papers_*.csv) — เลือกได้หลายไฟล์
          </label>
          <input type="file" name="papers" accept=".csv" multiple className="text-sm" />
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
            <>
              <p className="text-green-700">
                อัปเดตคณาจารย์ {result.researchersUpserted ?? 0} คน · บทความใหม่ {result.newPubs ?? 0} รายการ ·
                อัปเดตบทความเดิม {result.updatedPubs ?? 0} รายการ
              </p>
              {result.unmatched && result.unmatched.length > 0 && (
                <div className="mt-3">
                  <p className="text-amber-700">
                    จับคู่ไฟล์เหล่านี้กับคณาจารย์ในระบบไม่สำเร็จ (ตรวจ Scopus ID/ชื่อในไฟล์ หรือเพิ่มคณาจารย์ก่อน):
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
