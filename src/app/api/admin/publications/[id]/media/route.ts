import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getBucket, getDb } from "@/lib/firebaseAdmin";
import { absoluteUrl } from "@/lib/requestUrl";
import type { MediaFile, Publication, PublicationMedia } from "@/types";

async function uploadToStorage(file: File, folder: string): Promise<string> {
  const bucket = getBucket();
  const ext = file.name.split(".").pop() ?? "bin";
  const objectPath = `media/${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = bucket.file(objectPath);
  await blob.save(buffer, { contentType: file.type || "application/octet-stream" });
  await blob.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${objectPath}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const ref = db.collection("publications").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "ไม่พบผลงานนี้" }, { status: 404 });
  }

  const form = await request.formData();
  const existing = (doc.data() as Publication).media ?? {};
  const media: PublicationMedia = { ...existing };

  const coverImage = form.get("cover_image");
  if (coverImage instanceof File && coverImage.size > 0) {
    media.cover_image_url = await uploadToStorage(coverImage, `${id}/cover`);
  }

  const galleryFiles = form.getAll("gallery").filter((f): f is File => f instanceof File && f.size > 0);
  if (galleryFiles.length > 0) {
    const urls = await Promise.all(galleryFiles.map((f) => uploadToStorage(f, `${id}/gallery`)));
    media.gallery_urls = [...(media.gallery_urls ?? []), ...urls];
  }

  const videoUrl = String(form.get("video_url") ?? "").trim();
  if (videoUrl) {
    media.video_url = videoUrl;
  }

  const docFiles = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (docFiles.length > 0) {
    const uploaded: MediaFile[] = await Promise.all(
      docFiles.map(async (f) => ({
        name: f.name,
        url: await uploadToStorage(f, `${id}/files`),
        size: f.size,
      }))
    );
    media.files = [...(media.files ?? []), ...uploaded];
  }

  await ref.update({ media });

  return NextResponse.redirect(absoluteUrl(`/publications/${id}`, request), { status: 303 });
}
