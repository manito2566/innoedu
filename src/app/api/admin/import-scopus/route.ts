import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import {
  normalizeName,
  parsePapersCsv,
  parseResearcherRoster,
  publicationDocId,
  slugifyName,
} from "@/lib/scopusImport";
import type { Publication, Researcher } from "@/types";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const rosterFile = form.get("roster");
  const paperFiles = form.getAll("papers").filter((f): f is File => f instanceof File);

  const db = getDb();
  const researcherIdByScopusId = new Map<string, string>();
  const researcherIdByNameTh = new Map<string, string>();

  let researchersUpserted = 0;

  if (rosterFile instanceof File) {
    const text = await rosterFile.text();
    const roster = parseResearcherRoster(text);
    const batch = db.batch();
    for (const r of roster) {
      const id = r.scopus_id ?? slugifyName(r.name_th);
      batch.set(db.collection("researchers").doc(id), r, { merge: true });
      if (r.scopus_id) researcherIdByScopusId.set(r.scopus_id, id);
      researcherIdByNameTh.set(normalizeName(r.name_th), id);
      researchersUpserted++;
    }
    await batch.commit();
  } else {
    // No roster refresh this time; still need name -> id lookups for matching.
    const snap = await db.collection("researchers").get();
    for (const doc of snap.docs) {
      const r = doc.data() as Omit<Researcher, "id">;
      if (r.scopus_id) researcherIdByScopusId.set(r.scopus_id, doc.id);
      researcherIdByNameTh.set(normalizeName(r.name_th), doc.id);
    }
  }

  let newPubs = 0;
  let updatedPubs = 0;
  const unmatched: string[] = [];

  for (const file of paperFiles) {
    const text = await file.text();
    const parsed = parsePapersCsv(text);
    let researcherId: string | undefined;
    if (parsed.scopusId) researcherId = researcherIdByScopusId.get(parsed.scopusId);
    if (!researcherId) researcherId = researcherIdByNameTh.get(normalizeName(parsed.nameTh));

    if (!researcherId) {
      unmatched.push(file.name);
      continue;
    }

    const batch = db.batch();
    for (const pub of parsed.publications) {
      const docId = publicationDocId(pub, researcherId);
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
        updatedPubs++;
      } else {
        batch.set(ref, { ...pub, researcher_id: researcherId });
        newPubs++;
      }
    }
    await batch.commit();
  }

  await db.collection("import_batches").add({
    filename: `${rosterFile instanceof File ? rosterFile.name + " + " : ""}${paperFiles.length} papers files`,
    source_db: "scopus",
    imported_at: new Date().toISOString(),
    row_count: newPubs,
  });

  return NextResponse.json({ researchersUpserted, newPubs, updatedPubs, unmatched });
}
