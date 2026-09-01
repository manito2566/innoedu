/**
 * Importer: reads the Scopus CSV exports in data/raw/ and upserts
 * researchers + publications into Firestore (emulator during dev, real
 * project when FIRESTORE_EMULATOR_HOST is unset and credentials are present).
 *
 * Safe to re-run every year with a refreshed export: researchers are keyed
 * by scopus_id (or a name slug when absent) and publications are keyed by
 * Scopus EID, so re-importing only adds genuinely new rows instead of
 * duplicating everything.
 *
 * Usage:
 *   firebase emulators:exec --only firestore "npx tsx scripts/seed-from-csv.ts"
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { getDb } from "../src/lib/firebaseAdmin";
import {
  normalizeName,
  parsePapersCsv,
  parseResearcherRoster,
  publicationDocId,
  slugifyName,
} from "../src/lib/scopusImport";
import type { Publication } from "../src/types";

const RAW_DIR = path.join(process.cwd(), "data", "raw");

async function main() {
  const db = getDb();

  const rosterFile = readdirSync(RAW_DIR).find((f) => f.startsWith("researchers_filtered_"));
  if (!rosterFile) throw new Error("researchers_filtered_*.csv not found in data/raw");

  console.log("Loading researcher roster...");
  const roster = parseResearcherRoster(readFileSync(path.join(RAW_DIR, rosterFile), "utf-8"));
  console.log(`  ${roster.length} researchers found`);

  console.log("Upserting researchers collection...");
  const researcherIdByScopusId = new Map<string, string>();
  const researcherIdByNameTh = new Map<string, string>();

  let batch = db.batch();
  let batchCount = 0;
  for (const r of roster) {
    const id = r.scopus_id ?? slugifyName(r.name_th);
    const ref = db.collection("researchers").doc(id);
    batch.set(ref, r, { merge: true });
    if (r.scopus_id) researcherIdByScopusId.set(r.scopus_id, id);
    researcherIdByNameTh.set(normalizeName(r.name_th), id);
    batchCount++;
    if (batchCount >= 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) await batch.commit();

  console.log("Loading per-researcher paper files...");
  const paperFiles = readdirSync(RAW_DIR).filter((f) => f.startsWith("papers_"));

  let newPubs = 0;
  let updatedPubs = 0;
  const unmatched: string[] = [];
  batch = db.batch();
  batchCount = 0;

  for (const file of paperFiles) {
    const parsed = parsePapersCsv(readFileSync(path.join(RAW_DIR, file), "utf-8"));
    let researcherId: string | undefined;
    if (parsed.scopusId) researcherId = researcherIdByScopusId.get(parsed.scopusId);
    if (!researcherId) researcherId = researcherIdByNameTh.get(normalizeName(parsed.nameTh));

    if (!researcherId) {
      unmatched.push(file);
      continue;
    }

    for (const pub of parsed.publications) {
      const docId = publicationDocId(pub, researcherId);
      const ref = db.collection("publications").doc(docId);
      const existing = await ref.get();
      if (existing.exists) {
        // Refresh Scopus-derived fields (citations, etc.) but never clobber
        // a classification a human already reviewed.
        const { innovation_category, innovation_level, classification_status, classification_note } =
          existing.data() as Publication;
        batch.set(
          ref,
          {
            ...pub,
            researcher_id: researcherId,
            innovation_category,
            innovation_level,
            classification_status,
            classification_note,
          },
          { merge: true }
        );
        updatedPubs++;
      } else {
        batch.set(ref, { ...pub, researcher_id: researcherId });
        newPubs++;
      }
      batchCount++;
      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }
  if (batchCount > 0) await batch.commit();

  await db.collection("import_batches").add({
    filename: "data/raw/*.csv (Scopus import)",
    source_db: "scopus",
    imported_at: new Date().toISOString(),
    row_count: newPubs,
  });

  console.log(`Upserted ${roster.length} researchers. Publications: ${newPubs} new, ${updatedPubs} refreshed.`);
  if (unmatched.length > 0) {
    console.warn("Could not match these paper files to a researcher:", unmatched);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
