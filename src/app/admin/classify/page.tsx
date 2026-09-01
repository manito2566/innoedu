import { getAllResearchers, getUnconfirmedPublications } from "@/lib/data";
import { ClassifyTable, type ClassifyRow } from "@/components/ClassifyTable";

export const dynamic = "force-dynamic";

export default async function AdminClassifyPage() {
  const [publications, researchers] = await Promise.all([
    getUnconfirmedPublications(),
    getAllResearchers(),
  ]);
  const researcherById = new Map(researchers.map((r) => [r.id, r]));

  const rows: ClassifyRow[] = publications
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .map((p) => ({
      ...p,
      researcher_name: researcherById.get(p.researcher_id)?.name_th ?? "ไม่ทราบชื่อ",
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">จัดประเภทนวัตกรรม</h1>
        <p className="mt-1 text-sm text-slate-500">
          ประเภทนวัตกรรมถูกแนะนำอัตโนมัติจากคำสำคัญในชื่อเรื่อง/วารสาร ส่วนระดับการเปลี่ยนแปลงต้องเลือกเอง —
          บทความจะนับเป็นหลักฐาน EdPEx ได้ก็ต่อเมื่อยืนยันครบทั้งสองมิติ
        </p>
      </div>
      <ClassifyTable rows={rows} />
    </div>
  );
}
