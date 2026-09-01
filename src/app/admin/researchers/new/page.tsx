export default async function NewResearcherPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">เพิ่มคณาจารย์ใหม่</h1>
        <p className="mt-1 text-sm text-slate-500">
          สำหรับอาจารย์ที่ยังไม่มีชื่อในระบบเลย (ไม่มีทั้งใน Scopus และฐานอื่น) — เพิ่มแล้วสามารถนำเข้า/เพิ่มผลงานของอาจารย์ท่านนี้ได้ต่อ
        </p>
      </div>

      <form action="/api/admin/researchers" method="POST" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {error && <p className="text-sm text-red-600">กรุณากรอกชื่อ (ไทย) และภาควิชาให้ครบ</p>}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อ-สกุล (ไทย) *</label>
          <input name="name_th" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อ-สกุล (อังกฤษ)</label>
          <input name="name_en" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ภาควิชา *</label>
          <input name="department" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Scopus ID (ถ้ามี)</label>
          <input name="scopus_id" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          บันทึก
        </button>
      </form>
    </div>
  );
}
