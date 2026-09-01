import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { parsePublishOrPerishCsv, scholarPublicationDocId } from "@/lib/scholarImport";
import type { Publication } from "@/types";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const researcherId = String(form.get("researcher_id") ?? "");
  const file = form.get("file");

  if (!researcherId || !(file instanceof File)) {
    return NextResponse.json({ error: "กรุณาเลือกคณาจารย์และแนบไฟล์ CSV" }, { status: 400 });
  }

  const db = getDb();
  const researcherDoc = await db.collection("researchers").doc(researcherId).get();
  if (!researcherDoc.exists) {
    return NextResponse.json({ error: "ไม่พบคณาจารย์ที่เลือก" }, { status: 400 });
  }

  const text = await file.text();
  let publications;
  try {
    publications = parsePublishOrPerishCsv(text);
  } catch {
    return NextResponse.json({ error: "อ่านไฟล์ CSV ไม่สำเร็จ ตรวจสอบว่าเป็นไฟล์ export จาก Publish or Perish" }, { status: 400 });
  }

  let inserted = 0;
  let updated = 0;
  const batch = db.batch();

  for (const pub of publications) {
    const docId = scholarPublicationDocId(pub, researcherId);
    const ref = db.collection("publications").doc(docId);
    const existing = await ref.get();

    if (existing.exists) {
      const prev = existing.data() as Publication;
      batch.set(
        ref,
        {
          ...pub,
          researcher_id: researcherId,
          innovation_category: prev.innovation_category,
          innovation_level: prev.innovation_level,
          classification_status: prev.classification_status,
          classification_note: prev.classification_note,
        },
        { merge: true }
      );
      updated++;
    } else {
      batch.set(ref, { ...pub, researcher_id: researcherId });
      inserted++;
    }
  }

  await batch.commit();
  await db.collection("import_batches").add({
    filename: file.name,
    source_db: "google_scholar",
    imported_at: new Date().toISOString(),
    row_count: inserted,
  });

  return NextResponse.json({ inserted, updated, total: publications.length });
}
