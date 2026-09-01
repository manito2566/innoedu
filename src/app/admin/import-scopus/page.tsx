import { ScopusImportForm } from "@/components/ScopusImportForm";

export default function ImportScopusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">นำเข้าข้อมูลจาก Scopus (ประจำปี)</h1>
        <p className="mt-1 text-sm text-slate-500">
          ใช้หน้านี้เมื่อดาวน์โหลดไฟล์ CSV ชุดใหม่จากระบบ Scopus ของมหาวิทยาลัย (รูปแบบไฟล์เดียวกับตอนเริ่มระบบ) —
          นำเข้าซ้ำได้ทุกปีโดยไม่ทำให้ข้อมูลซ้ำ: บทความที่เคยนำเข้าแล้ว (เช็คจาก Scopus EID) จะแค่อัปเดตยอด citation
          ส่วนบทความใหม่ที่ตีพิมพ์เพิ่มจะถูกเพิ่มเข้ามา และจะ<strong>ไม่ไปแก้ประเภทนวัตกรรมที่ยืนยันไว้แล้ว</strong>
        </p>
      </div>
      <ScopusImportForm />
    </div>
  );
}
