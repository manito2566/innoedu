import { getAllResearchers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewPublicationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; researcher?: string }>;
}) {
  const { error, researcher } = await searchParams;
  const researchers = await getAllResearchers();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">เพิ่มผลงานทีละรายการ</h1>
        <p className="mt-1 text-sm text-slate-500">
          เหมาะสำหรับผลงานเดี่ยวๆ ที่ไม่สะดวกทำเป็น CSV เช่นผลงานจาก Google Scholar หรือ TCI รายการเดียว
        </p>
      </div>

      <form action="/api/admin/publications" method="POST" className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        {error && <p className="text-sm text-red-600">กรุณาเลือกคณาจารย์และกรอกชื่อเรื่อง</p>}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">คณาจารย์ *</label>
          <select
            name="researcher_id"
            required
            defaultValue={researcher ?? ""}
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
          <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อเรื่อง *</label>
          <input name="title" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">ปี พ.ศ./ค.ศ.</label>
            <input name="year" type="number" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">ประเภท</label>
            <select name="pub_type" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="Journal">Journal</option>
              <option value="Conference">Conference</option>
              <option value="Book">Book / Book Chapter</option>
              <option value="Other">อื่นๆ</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อวารสาร/แหล่งตีพิมพ์</label>
          <input name="source_title" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">DOI หรือลิงก์ (ถ้ามี)</label>
          <input name="doi" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ฐานข้อมูล</label>
          <select name="source_db" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="tci">TCI</option>
            <option value="google_scholar">Google Scholar</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          บันทึก
        </button>
      </form>
    </div>
  );
}
