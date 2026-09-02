import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { slugifyName } from "@/lib/scopusImport";
import { absoluteUrl } from "@/lib/requestUrl";
import type { Researcher } from "@/types";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const name_th = String(form.get("name_th") ?? "").trim();
  const name_en = String(form.get("name_en") ?? "").trim();
  const department = String(form.get("department") ?? "").trim();
  const scopus_id = String(form.get("scopus_id") ?? "").trim() || null;

  if (!name_th || !department) {
    const url = absoluteUrl("/admin/researchers/new", request);
    url.searchParams.set("error", "missing_fields");
    return NextResponse.redirect(url, { status: 303 });
  }

  const db = getDb();
  const id = scopus_id ?? slugifyName(name_th);
  const researcher: Omit<Researcher, "id"> = {
    name_th,
    name_en,
    department,
    scopus_id,
    scopus_url: scopus_id ? `https://www.scopus.com/authid/detail.uri?authorId=${scopus_id}` : null,
    documents_count: 0,
    citations: 0,
    h_index: 0,
    has_scopus_data: false,
  };

  await db.collection("researchers").doc(id).set(researcher, { merge: true });

  return NextResponse.redirect(absoluteUrl(`/researchers/${id}`, request), { status: 303 });
}
