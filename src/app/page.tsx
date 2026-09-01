import { getAllPublications, getAllResearchers } from "@/lib/data";
import { CATEGORIES, LEVELS } from "@/lib/taxonomy";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { SimpleLineChart } from "@/components/charts/SimpleLineChart";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const [researchers, publications] = await Promise.all([
    getAllResearchers(),
    getAllPublications(),
  ]);

  const confirmed = publications.filter((p) => p.classification_status === "confirmed");
  const suggested = publications.filter((p) => p.classification_status === "suggested");
  const unclassified = publications.filter((p) => p.classification_status === "unclassified");
  const withScopus = researchers.filter((r) => r.has_scopus_data).length;

  const byCategory = CATEGORIES.map((c) => ({
    label: c.name_th.split(" (")[0],
    value: publications.filter((p) => p.innovation_category === c.id).length,
  }));

  const byLevel = LEVELS.map((l) => ({
    label: l.name_th.split(" (")[0],
    value: publications.filter((p) => p.innovation_level === l.id).length,
  }));

  const byDepartment = Object.entries(
    researchers.reduce<Record<string, number>>((acc, r) => {
      const count = publications.filter((p) => p.researcher_id === r.id).length;
      acc[r.department] = (acc[r.department] ?? 0) + count;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const byYear = Object.entries(
    publications.reduce<Record<string, number>>((acc, p) => {
      if (!p.year) return acc;
      const key = String(p.year);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          ภาพรวมผลงานตีพิมพ์และการจัดประเภทนวัตกรรม
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          หลักฐานประกอบการประเมิน EdPEx ภารกิจผลิตและเผยแพร่นวัตกรรม คณะศึกษาศาสตร์
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="คณาจารย์ทั้งหมด" value={researchers.length} sub={`มีข้อมูล Scopus ${withScopus} คน`} />
        <StatCard label="ผลงานตีพิมพ์ทั้งหมด" value={publications.length} />
        <StatCard label="ยืนยันประเภทแล้ว" value={confirmed.length} sub="นับเป็นหลักฐาน EdPEx" />
        <StatCard
          label="รอตรวจสอบ"
          value={suggested.length + unclassified.length}
          sub={`แนะนำอัตโนมัติ ${suggested.length} / ยังไม่จัดประเภท ${unclassified.length}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="จำนวนบทความตามประเภทนวัตกรรม (Oslo Manual / OECD)">
          <SimpleBarChart data={byCategory} />
        </ChartCard>
        <ChartCard title="จำนวนบทความตามระดับการเปลี่ยนแปลง (Christensen / Serdyukov)">
          <SimpleBarChart data={byLevel} color="#16a34a" />
        </ChartCard>
        <ChartCard title="จำนวนบทความตามภาควิชา">
          <SimpleBarChart data={byDepartment} color="#9333ea" />
        </ChartCard>
        <ChartCard title="แนวโน้มจำนวนบทความรายปี">
          <SimpleLineChart data={byYear} />
        </ChartCard>
      </div>
    </div>
  );
}
