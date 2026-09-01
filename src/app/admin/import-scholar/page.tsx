import { getAllResearchers } from "@/lib/data";
import { ScholarImportForm } from "@/components/ScholarImportForm";

export const dynamic = "force-dynamic";

export default async function ImportScholarPage() {
  const researchers = await getAllResearchers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">นำเข้าผลงานจาก Google Scholar (Publish or Perish)</h1>
        <p className="mt-1 text-sm text-slate-500">
          วิธีใช้: เปิดโปรแกรม Publish or Perish → ค้นหาด้วยชื่ออาจารย์ท่านเดียว (เช่น &quot;Author impact analysis&quot;
          หรือค้นตามชื่อ) → กด Save/Export as CSV → นำไฟล์นั้นมาอัปโหลดที่นี่ พร้อมเลือกชื่ออาจารย์เจ้าของผลงานให้ตรงกับที่ค้น
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <strong>สำคัญ</strong>: คอลัมน์ &quot;Authors&quot; ในไฟล์ของ Publish or Perish จะมีชื่อผู้แต่งร่วมทุกคน
          ไม่ใช่แค่อาจารย์ที่ค้น ระบบจึงให้เลือกอาจารย์เจ้าของผลงานทั้งไฟล์ล่วงหน้าแทนการจับคู่ชื่ออัตโนมัติ —
          ถ้าไฟล์ปนผลงานของคนอื่นมาด้วย (เช่นค้นชื่อซ้ำกับคนอื่น) ให้ลบแถวนั้นออกจากไฟล์ก่อนนำเข้า
        </p>
        <p className="mt-2 text-sm text-slate-500">
          นำเข้าไฟล์เดิม/ไฟล์ใหม่ของอาจารย์คนเดิมซ้ำได้โดยไม่เพิ่มรายการซ้ำ (เช็คจาก DOI หรือชื่อเรื่อง+ปีให้อัตโนมัติ)
          และจะไม่ไปแก้ประเภทนวัตกรรมที่ยืนยันไว้แล้ว
        </p>
      </div>
      <ScholarImportForm researchers={researchers} />
    </div>
  );
}
