import Link from "next/link";
import { getAllResearchers } from "@/lib/data";

export default async function ResearchersPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>;
}) {
  const { dept } = await searchParams;
  const researchers = await getAllResearchers();
  const departments = Array.from(new Set(researchers.map((r) => r.department))).sort();
  const filtered = dept ? researchers.filter((r) => r.department === dept) : researchers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">คณาจารย์</h1>
        <p className="mt-1 text-sm text-slate-500">
          รายชื่อคณาจารย์ทั้งหมด {researchers.length} คน (รวมผู้ที่ยังไม่มีผลงานใน Scopus)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/researchers"
          className={`rounded-full px-3 py-1 ${!dept ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          ทั้งหมด
        </Link>
        {departments.map((d) => (
          <Link
            key={d}
            href={`/researchers?dept=${encodeURIComponent(d)}`}
            className={`rounded-full px-3 py-1 ${dept === d ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            {d}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">ภาควิชา</th>
              <th className="px-4 py-3 text-right">ผลงาน (Scopus)</th>
              <th className="px-4 py-3 text-right">Citations</th>
              <th className="px-4 py-3 text-right">h-index</th>
              <th className="px-4 py-3">แหล่งข้อมูล</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/researchers/${r.id}`} className="font-medium text-blue-600 hover:underline">
                    {r.name_th}
                  </Link>
                  <div className="text-xs text-slate-400">{r.name_en}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{r.department}</td>
                <td className="px-4 py-3 text-right">{r.documents_count}</td>
                <td className="px-4 py-3 text-right">{r.citations}</td>
                <td className="px-4 py-3 text-right">{r.h_index}</td>
                <td className="px-4 py-3">
                  {r.has_scopus_data ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Scopus</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">ยังไม่มีผลงานใน Scopus</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
