import { NextResponse, type NextRequest } from "next/server";
import { updateClassification } from "@/lib/data";
import type { InnovationCategory, InnovationLevel } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, innovation_category, innovation_level, classification_note } = body as {
    id: string;
    innovation_category: InnovationCategory | null;
    innovation_level: InnovationLevel | null;
    classification_note?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const status = innovation_category && innovation_level ? "confirmed" : "suggested";

  await updateClassification(id, {
    innovation_category,
    innovation_level,
    classification_status: status,
    classification_note: classification_note ?? "",
  });

  return NextResponse.json({ ok: true, status });
}
