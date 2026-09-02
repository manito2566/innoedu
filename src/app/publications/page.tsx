import Link from "next/link";
import { getAllPublications, getAllResearchers } from "@/lib/data";
import { CATEGORIES, LEVELS } from "@/lib/taxonomy";
import { CategoryBadge, LevelBadge, StatusBadge } from "@/components/Badges";

interface Filters {
  category?: string;
  level?: string;
  status?: string;
  source?: string;
  q?: string;
}

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  const filters = await searchParams;
  const [publications, researchers] = await Promise.all([getAllPublications(), getAllResearchers()]);
  const researcherById = new Map(researchers.map((r) => [r.id, r]));

  let rows = publications;
  if (filters.category) rows = rows.filter((p) => p.innovation_category === filters.category);
  if (filters.level) rows = rows.filter((p) => p.innovation_level === filters.level);
  if (filters.status) rows = rows.filter((p) => p.classification_status === filters.status);
  if (filters.source) rows = rows.filter((p) => p.source_db === filters.source);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter((p) => p.title.toLowerCase().includes(q) || p.source_title.toLowerCase().includes(q));
  }
  rows = rows.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ผลงานตีพิมพ์</h1>
        <p className="mt-1 text-sm text-slate-500">
          พบ {rows.length} รายการ จากทั้งหมด {publications.length} รายการ
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <div>
          <label className="mb-1 block text-xs text-slate-500">ค้นหาชื่อเรื่อง/วารสาร</label>
          <input
            type="text"
            name="q"
            defaultValue={filters.q}
            className="w-56 rounded-md border border-slate-300 px-3 py-1.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">ประเภทนวัตกรรม</label>
          <select name="category" defaultValue={filters.category ?? ""} className="rounded-md border border-slate-300 px-3 py-1.5">
            <option value="">ทั้งหมด</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">ระดับการเปลี่ยนแปลง</label>
          <select name="level" defaultValue={filters.level ?? ""} className="rounded-md border border-slate-300 px-3 py-1.5">
            <option value="">ทั้งหมด</option>
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">สถานะ</label>
          <select name="status" defaultValue={filters.status ?? ""} className="rounded-md border border-slate-300 px-3 py-1.5">
            <option value="">ทั้งหมด</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="suggested">แนะนำอัตโนมัติ</option>
            <option value="unclassified">ยังไม่จัดประเภท</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">แหล่งข้อมูล</label>
          <select name="source" defaultValue={filters.source ?? ""} className="rounded-md border border-slate-300 px-3 py-1.5">
            <option value="">ทั้งหมด</option>
            <option value="scopus">Scopus</option>
            <option value="tci">TCI</option>
            <option value="google_scholar">Google Scholar</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700">
          กรอง
        </button>
        {(filters.q || filters.category || filters.level || filters.status || filters.source) && (
          <Link href="/publications" className="text-slate-500 hover:underline">
            ล้างตัวกรอง
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">ชื่อเรื่อง</th>
              <th className="px-4 py-3">ผู้วิจัย</th>
              <th className="px-4 py-3">ปี</th>
              <th className="px-4 py-3">ประเภท</th>
              <th className="px-4 py-3">ระดับ</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">แหล่งข้อมูล</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((p) => {
              const researcher = researcherById.get(p.researcher_id);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="max-w-sm px-4 py-3">
                    <Link href={`/publications/${p.id}`} className="text-slate-800 hover:text-blue-600 hover:underline">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {researcher ? (
                      <Link href={`/researchers/${researcher.id}`} className="text-blue-600 hover:underline">
                        {researcher.name_th}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{p.year ?? "—"}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={p.innovation_category} />
                  </td>
                  <td className="px-4 py-3">
                    <LevelBadge level={p.innovation_level} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.classification_status} />
                  </td>
                  <td className="px-4 py-3 uppercase text-slate-500">{p.source_db}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
