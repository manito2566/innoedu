import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/firebaseAdmin";
import type { Publication } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDb().collection("publications").doc(id).get();
  if (!doc.exists) notFound();
  const pub = { id: doc.id, ...(doc.data() as Omit<Publication, "id">) };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">จัดการสื่อเผยแพร่</h1>
        <p className="mt-1 text-sm text-slate-500">{pub.title}</p>
        <Link href={`/publications/${id}`} className="text-sm text-blue-600 hover:underline">
          ดูหน้าเผยแพร่จริง →
        </Link>
      </div>

      <form
        action={`/api/admin/publications/${id}/media`}
        method="POST"
        encType="multipart/form-data"
        className="space-y-5 rounded-lg border border-slate-200 bg-white p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ภาพหน้าปก (cover image)</label>
          <input type="file" name="cover_image" accept="image/*" className="text-sm" />
          {pub.media?.cover_image_url && (
            <p className="mt-1 text-xs text-slate-400">มีภาพหน้าปกอยู่แล้ว — อัปโหลดใหม่เพื่อแทนที่</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ภาพประกอบ/อินโฟกราฟิก (เพิ่มได้หลายภาพ)</label>
          <input type="file" name="gallery" accept="image/*" multiple className="text-sm" />
          {pub.media?.gallery_urls && pub.media.gallery_urls.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">มีภาพอยู่แล้ว {pub.media.gallery_urls.length} ภาพ — ที่อัปโหลดใหม่จะเพิ่มต่อ</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            ลิงก์วิดีโอ (YouTube, Canva แชร์ลิงก์ ฯลฯ)
          </label>
          <input
            type="text"
            name="video_url"
            defaultValue={pub.media?.video_url ?? ""}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ไฟล์สำหรับดาวน์โหลด (PDF, PPTX ฯลฯ)</label>
          <input type="file" name="files" multiple className="text-sm" />
          {pub.media?.files && pub.media.files.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">มีไฟล์อยู่แล้ว {pub.media.files.length} ไฟล์ — ที่อัปโหลดใหม่จะเพิ่มต่อ</p>
          )}
        </div>

        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          บันทึกสื่อ
        </button>
      </form>
    </div>
  );
}
