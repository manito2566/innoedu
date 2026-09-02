import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import type { Publication } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "missing url" }, { status: 400 });

  const ref = getDb().collection("publications").doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Only allow redirecting to a file actually attached to this publication,
  // so this route can't be used as an open redirect.
  const media = (doc.data() as Publication).media;
  const knownUrls = [
    media?.cover_image_url,
    ...(media?.gallery_urls ?? []),
    ...(media?.files ?? []).map((f) => f.url),
  ].filter(Boolean);
  if (!knownUrls.includes(url)) {
    return NextResponse.json({ error: "unknown file for this publication" }, { status: 400 });
  }

  await ref.update({ download_count: FieldValue.increment(1) }).catch(() => {});
  return NextResponse.redirect(url);
}
