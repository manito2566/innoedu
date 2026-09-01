import { notFound } from "next/navigation";
import { getPublicationsForResearcher, getResearcher } from "@/lib/data";
import { CategoryBadge, LevelBadge, StatusBadge } from "@/components/Badges";

export default async function ResearcherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const researcher = await getResearcher(id);
  if (!researcher) notFound();

  const publications = (await getPublicationsForResearcher(id)).sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{researcher.name_th}</h1>
        <p className="text-sm text-slate-500">{researcher.name_en}</p>
        <p className="mt-1 text-sm text-slate-600">{researcher.department}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-slate-500">ผลงาน (Scopus)</p>
          <p className="text-2xl font-semibold">{researcher.documents_count}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-slate-500">Citations</p>
          <p className="text-2xl font-semibold">{researcher.citations}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-slate-500">h-index</p>
          <p className="text-2xl font-semibold">{researcher.h_index}</p>
        </div>
      </div>

      {publications.length === 0 ? (
        <p className="text-sm text-slate-500">ยังไม่มีผลงานตีพิมพ์ในระบบสำหรับคณาจารย์ท่านนี้</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ชื่อเรื่อง</th>
                <th className="px-4 py-3">ปี</th>
                <th className="px-4 py-3">วารสาร</th>
                <th className="px-4 py-3">ประเภทนวัตกรรม</th>
                <th className="px-4 py-3">ระดับ</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publications.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="max-w-md px-4 py-3">
                    {p.doi ? (
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </td>
                  <td className="px-4 py-3">{p.year ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{p.source_title}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={p.innovation_category} />
                  </td>
                  <td className="px-4 py-3">
                    <LevelBadge level={p.innovation_level} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.classification_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
