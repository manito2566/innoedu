/**
 * Applies AI-generated category/level suggestions to publications. Only
 * ever writes classification_status: "suggested" (never "confirmed") and
 * skips any publication that has since been confirmed by a human, so this
 * is always safe to re-run.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=... FIREBASE_PROJECT_ID=... npx tsx scripts/apply-ai-classifications.ts <input-path>
 */
import { readFileSync } from "node:fs";
import { getDb } from "../src/lib/firebaseAdmin";
import type { InnovationCategory, InnovationLevel } from "../src/types";

interface Suggestion {
  id: string;
  innovation_category: InnovationCategory;
  innovation_level: InnovationLevel;
  classification_note: string;
}

async function main() {
  const inPath = process.argv[2];
  if (!inPath) throw new Error("Usage: apply-ai-classifications.ts <input-path>");

  const suggestions: Suggestion[] = JSON.parse(readFileSync(inPath, "utf-8"));
  const db = getDb();

  let applied = 0;
  let skippedConfirmed = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const s of suggestions) {
    const ref = db.collection("publications").doc(s.id);
    const doc = await ref.get();
    if (!doc.exists) continue;
    if (doc.data()?.classification_status === "confirmed") {
      skippedConfirmed++;
      continue;
    }

    batch.update(ref, {
      innovation_category: s.innovation_category,
      innovation_level: s.innovation_level,
      classification_status: "suggested",
      classification_note: s.classification_note,
    });
    applied++;
    batchCount++;
    if (batchCount >= 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) await batch.commit();

  console.log(`Applied AI suggestions to ${applied} publications. Skipped ${skippedConfirmed} already confirmed.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
