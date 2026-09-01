import { NextResponse, type NextRequest } from "next/server";
import Papa from "papaparse";
import { getDb } from "@/lib/firebaseAdmin";
import { suggestCategory } from "@/lib/taxonomy";
import { normalizeName, publicationDocId, slugifyName } from "@/lib/scopusImport";
import type { Publication, Researcher, SourceDb } from "@/types";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const sourceDb = (form.get("source_db") as SourceDb | null) ?? "tci";
  const autoCreate = form.get("auto_create") === "on";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "กรุณาแนบไฟล์ CSV" }, { status: 400 });
  }

  const text = (await file.text()).replace(/^﻿/, "");
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: "อ่านไฟล์ CSV ไม่สำเร็จ", details: parsed.errors.slice(0, 3) },
      { status: 400 }
    );
  }

  const db = getDb();
  const researchersSnap = await db.collection("researchers").get();
  const researchers = researchersSnap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Researcher, "id">) })
  );
  const byNameTh = new Map(researchers.map((r) => [normalizeName(r.name_th), r.id]));
  const byNameEn = new Map(
    researchers.filter((r) => r.name_en).map((r) => [normalizeName(r.name_en), r.id])
  );

  let inserted = 0;
  let updated = 0;
  let created = 0;
  const unmatched: string[] = [];
  const batch = db.batch();

  for (const row of parsed.data) {
    const authorName = (row["ชื่อผู้แต่ง"] ?? row["author"] ?? row["researcher"] ?? "").trim();
    const title = (row["ชื่อเรื่อง"] ?? row["title"] ?? "").trim();
    if (!title) continue;

    const key = normalizeName(authorName);
    let researcherId = byNameTh.get(key) ?? byNameEn.get(key);

    if (!researcherId && autoCreate && authorName) {
      researcherId = slugifyName(authorName);
      const newResearcher: Omit<Researcher, "id"> = {
        name_th: authorName,
        name_en: "",
        department: (row["ภาควิชา"] ?? row["department"] ?? "").trim(),
        scopus_id: null,
        scopus_url: null,
        documents_count: 0,
        citations: 0,
        h_index: 0,
        has_scopus_data: false,
      };
      batch.set(db.collection("researchers").doc(researcherId), newResearcher, { merge: true });
      byNameTh.set(key, researcherId);
      created++;
    }

    if (!researcherId) {
      unmatched.push(authorName || title);
      continue;
    }

    const sourceTitle = (row["ชื่อวารสาร"] ?? row["source_title"] ?? "").trim();
    const yearRaw = (row["ปี"] ?? row["year"] ?? "").trim();
    const yearNum = parseInt(yearRaw, 10);
    const year = Number.isFinite(yearNum) ? yearNum : null;
    const doi = (row["doi"] ?? row["DOI"] ?? "").trim();
    const category = suggestCategory(`${title} ${sourceTitle}`);

    const docId = publicationDocId({ doi, title, year }, researcherId);
    const ref = db.collection("publications").doc(docId);
    const existing = await ref.get();

    const pub: Omit<Publication, "id"> = {
      researcher_id: researcherId,
      title,
      year,
      pub_type: (row["ประเภท"] ?? row["type"] ?? "Journal").trim(),
      source_title: sourceTitle,
      volume: (row["volume"] ?? "").trim(),
      issue: (row["issue"] ?? "").trim(),
      pages: (row["pages"] ?? "").trim(),
      authors: authorName,
      citations: 0,
      doi,
      scopus_url: "",
      eid: "",
      source_db: sourceDb,
      innovation_category: category,
      innovation_level: null,
      classification_status: category ? "suggested" : "unclassified",
      classification_note: "",
    };

    if (existing.exists) {
      const prev = existing.data() as Publication;
      batch.set(
        ref,
        {
          ...pub,
          innovation_category: prev.innovation_category,
          innovation_level: prev.innovation_level,
          classification_status: prev.classification_status,
          classification_note: prev.classification_note,
        },
        { merge: true }
      );
      updated++;
    } else {
      batch.set(ref, pub);
      inserted++;
    }
  }

  await batch.commit();
  await db.collection("import_batches").add({
    filename: file.name,
    source_db: sourceDb,
    imported_at: new Date().toISOString(),
    row_count: inserted,
  });

  return NextResponse.json({ inserted, updated, created, unmatched });
}
