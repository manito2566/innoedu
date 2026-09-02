import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await getDb()
    .collection("publications")
    .doc(id)
    .update({ view_count: FieldValue.increment(1) })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
