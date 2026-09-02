import Link from "next/link";
import { getAllPublications, getAllResearchers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminMediaListPage() {
  const [publications, researchers] = await Promise.all([getAllPublications(), getAllResearchers()]);
  const researcherById = new Map(researchers.map((r) => [r.id, r]));

  const confirmed = publications
    .filter((p) => p.classification_status === "confirmed")
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">จัดการสื่อเผยแพร่นวัตกรรม</h1>
        <p className="mt-1 text-sm text-slate-500">
          เลือกนวัตกรรมที่ยืนยันประเภทแล้วเพื่ออัปโหลดภาพ/วิดีโอ/ไฟล์สำหรับเผยแพร่ (สร้างสื่อด้วย skill
          &quot;article-to-social&quot; แยกต่างหาก แล้วนำไฟล์สำเร็จมาอัปโหลดที่นี่)
        </p>
      </div>

      {confirmed.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          ยังไม่มีบทความที่ยืนยันประเภทนวัตกรรมแล้ว — ไปที่{" "}
          <Link href="/admin/classify" className="text-blue-600 hover:underline">
            จัดประเภทนวัตกรรม
          </Link>{" "}
          ก่อน
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ชื่อเรื่อง</th>
                <th className="px-4 py-3">ผู้วิจัย</th>
                <th className="px-4 py-3">ปี</th>
                <th className="px-4 py-3">สื่อที่มี</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {confirmed.map((p) => {
                const researcher = researcherById.get(p.researcher_id);
                const mediaCount =
                  (p.media?.cover_image_url ? 1 : 0) +
                  (p.media?.gallery_urls?.length ?? 0) +
                  (p.media?.video_url ? 1 : 0) +
                  (p.media?.files?.length ?? 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="max-w-sm px-4 py-3">{p.title}</td>
                    <td className="px-4 py-3 text-slate-600">{researcher?.name_th ?? "—"}</td>
                    <td className="px-4 py-3">{p.year ?? "—"}</td>
                    <td className="px-4 py-3">
                      {mediaCount > 0 ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          {mediaCount} รายการ
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">ยังไม่มี</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/publications/${p.id}/media`} className="text-blue-600 hover:underline">
                        จัดการสื่อ
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
