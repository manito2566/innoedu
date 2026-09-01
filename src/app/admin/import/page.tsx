import { ImportForm } from "@/components/ImportForm";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">นำเข้าผลงานจากฐานข้อมูลอื่น</h1>
        <p className="mt-1 text-sm text-slate-500">
          สำหรับผลงานที่อยู่ใน TCI หรือฐานอื่นที่ไม่มีใน Scopus เตรียมไฟล์ CSV ที่มีคอลัมน์ต่อไปนี้ (ชื่อคอลัมน์ภาษาไทยหรืออังกฤษก็ได้):
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <code>ชื่อผู้แต่ง (author), ชื่อเรื่อง (title), ปี (year), ชื่อวารสาร (source_title), ประเภท (type), doi</code>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          ระบบจะจับคู่ <strong>ชื่อผู้แต่ง</strong> กับรายชื่อคณาจารย์ในระบบโดยอัตโนมัติ (ต้องสะกดชื่อ-สกุลให้ตรงกับที่ลงทะเบียนไว้) —
          รายการที่จับคู่ไม่ได้จะแสดงในผลลัพธ์ ให้แก้ไขไฟล์แล้วนำเข้าใหม่ หรือติ๊ก &quot;สร้างคณาจารย์ใหม่อัตโนมัติ&quot;
          ถ้าเป็นอาจารย์ที่ยังไม่มีในระบบเลย นำเข้าไฟล์เดิมซ้ำได้โดยไม่เพิ่มรายการซ้ำ (ระบบเช็คจาก DOI/ชื่อเรื่องให้อัตโนมัติ)
        </p>
        <p className="mt-2 text-sm text-slate-500">
          สำหรับผลงานที่สืบค้นด้วย Publish or Perish จาก Google Scholar ใช้{" "}
          <a href="/admin/import-scholar" className="text-blue-600 hover:underline">
            นำเข้า Google Scholar
          </a>{" "}
          แทน (รูปแบบไฟล์ไม่เหมือน CSV ทั่วไป) ส่วนผลงานเดี่ยวๆ ที่ไม่สะดวกทำเป็น CSV เลยใช้{" "}
          <a href="/admin/publications/new" className="text-blue-600 hover:underline">
            เพิ่มผลงานทีละรายการ
          </a>{" "}
          แทนได้ และถ้าอาจารย์ยังไม่มีชื่อในระบบเลยให้{" "}
          <a href="/admin/researchers/new" className="text-blue-600 hover:underline">
            เพิ่มคณาจารย์ใหม่
          </a>{" "}
          ก่อน
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
