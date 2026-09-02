/**
 * Fetches abstracts from CrossRef for publications that have a DOI but no
 * abstract yet, and stores them on the publication doc. CrossRef's "polite
 * pool" just wants a mailto in the User-Agent; no API key needed.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=... FIREBASE_PROJECT_ID=... npx tsx scripts/fetch-abstracts.ts
 */
import { getDb } from "../src/lib/firebaseAdmin";

const USER_AGENT = "InnoEDU/1.0 (mailto:manit42@gmail.com; for EdPEx innovation classification)";

function stripJatsTags(abstract: string): string {
  return abstract
    .replace(/<jats:[^>]+>/g, "")
    .replace(/<\/jats:[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchAbstract(doi: string): Promise<string | null> {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  const data = await res.json();
  const abstract = data?.message?.abstract;
  return abstract ? stripJatsTags(abstract) : null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const db = getDb();
  const snap = await db.collection("publications").where("classification_status", "!=", "confirmed").get();

  const candidates = snap.docs.filter((d) => {
    const data = d.data();
    return data.doi?.trim() && !data.abstract;
  });

  console.log(`${candidates.length} publications have a DOI and no abstract yet`);

  let fetched = 0;
  let notFound = 0;
  for (const doc of candidates) {
    const doi = doc.data().doi as string;
    try {
      const abstract = await fetchAbstract(doi);
      if (abstract) {
        await doc.ref.update({ abstract });
        fetched++;
      } else {
        notFound++;
      }
    } catch (err) {
      console.warn(`  failed for ${doi}:`, (err as Error).message);
    }
    await sleep(150); // stay polite to CrossRef's rate limits
    if ((fetched + notFound) % 25 === 0) {
      console.log(`  progress: ${fetched + notFound}/${candidates.length}`);
    }
  }

  console.log(`Done. Fetched ${fetched} abstracts, ${notFound} had none available.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
