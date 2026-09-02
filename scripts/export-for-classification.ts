/**
 * Exports every publication that is not yet "confirmed" to a local JSON
 * file, for a human (or an LLM acting as a first-pass reader) to review
 * and produce category/level suggestions from.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=... FIREBASE_PROJECT_ID=... npx tsx scripts/export-for-classification.ts <output-path>
 */
import { writeFileSync } from "node:fs";
import { getDb } from "../src/lib/firebaseAdmin";

async function main() {
  const outPath = process.argv[2];
  if (!outPath) throw new Error("Usage: export-for-classification.ts <output-path>");

  const db = getDb();
  const snap = await db.collection("publications").where("classification_status", "!=", "confirmed").get();

  const rows = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      source_title: data.source_title,
      abstract: data.abstract ?? null,
      current_category: data.innovation_category ?? null,
    };
  });

  writeFileSync(outPath, JSON.stringify(rows, null, 2), "utf-8");
  console.log(`Exported ${rows.length} publications to ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
