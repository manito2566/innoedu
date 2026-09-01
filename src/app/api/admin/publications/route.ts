import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { suggestCategory } from "@/lib/taxonomy";
import { publicationDocId } from "@/lib/scopusImport";
import type { Publication, SourceDb } from "@/types";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const researcher_id = String(form.get("researcher_id") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const yearRaw = String(form.get("year") ?? "").trim();
  const source_title = String(form.get("source_title") ?? "").trim();
  const doi = String(form.get("doi") ?? "").trim();
  const source_db = (form.get("source_db") as SourceDb | null) ?? "other";
  const pub_type = String(form.get("pub_type") ?? "Journal").trim();

  if (!researcher_id || !title) {
    const url = new URL("/admin/publications/new", request.url);
    url.searchParams.set("error", "missing_fields");
    return NextResponse.redirect(url, { status: 303 });
  }

  const db = getDb();
  const year = Number.isFinite(parseInt(yearRaw, 10)) ? parseInt(yearRaw, 10) : null;
  const category = suggestCategory(`${title} ${source_title}`);
  const docId = publicationDocId({ doi, title, year }, researcher_id);

  const pub: Omit<Publication, "id"> = {
    researcher_id,
    title,
    year,
    pub_type,
    source_title,
    volume: "",
    issue: "",
    pages: "",
    authors: "",
    citations: 0,
    doi,
    scopus_url: "",
    eid: "",
    source_db,
    innovation_category: category,
    innovation_level: null,
    classification_status: category ? "suggested" : "unclassified",
    classification_note: "",
  };

  await db.collection("publications").doc(docId).set(pub, { merge: true });

  return NextResponse.redirect(new URL(`/researchers/${researcher_id}`, request.url), { status: 303 });
}
