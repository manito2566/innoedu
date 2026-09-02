import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import { getPublication, getResearcher } from "@/lib/data";
import { CategoryBadge, LevelBadge, StatusBadge } from "@/components/Badges";
import { toYouTubeEmbedUrl } from "@/lib/videoEmbed";

export const dynamic = "force-dynamic";

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pub = await getPublication(id);
  if (!pub) notFound();

  // Best-effort view counter; never block rendering on it.
  getDb()
    .collection("publications")
    .doc(id)
    .update({ view_count: FieldValue.increment(1) })
    .catch(() => {});

  const researcher = await getResearcher(pub.researcher_id);
  const isAdmin = (await cookies()).get("innoedu_admin")?.value === process.env.ADMIN_PASSWORD;
  const media = pub.media;
  const embedUrl = media?.video_url ? toYouTubeEmbedUrl(media.video_url) : null;

  function downloadHref(url: string) {
    return `/api/publications/${id}/download?url=${encodeURIComponent(url)}`;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{pub.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {researcher ? (
              <Link href={`/researchers/${researcher.id}`} className="text-blue-600 hover:underline">
                {researcher.name_th}
              </Link>
            ) : (
              "—"
            )}{" "}
            · {pub.year ?? "—"} · {pub.source_title}
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/admin/publications/${id}/media`}
            className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            จัดการสื่อ
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={pub.innovation_category} />
        <LevelBadge level={pub.innovation_level} />
        <StatusBadge status={pub.classification_status} />
      </div>

      {media?.cover_image_url && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.cover_image_url} alt={pub.title} className="w-full object-cover" />
        </div>
      )}

      {pub.classification_note && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="mb-1 text-xs font-medium uppercase text-slate-400">สรุปแนวคิดนวัตกรรม</p>
          {pub.classification_note}
        </div>
      )}

      {pub.abstract && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="mb-1 text-xs font-medium uppercase text-slate-400">บทคัดย่อ</p>
          {pub.abstract}
        </div>
      )}

      {embedUrl && (
        <div className="aspect-video overflow-hidden rounded-lg border border-slate-200">
          <iframe src={embedUrl} className="h-full w-full" allowFullScreen title="วิดีโอแนะนำนวัตกรรม" />
        </div>
      )}
      {media?.video_url && !embedUrl && (
        <a href={media.video_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
          ดูวิดีโอแนะนำนวัตกรรม →
        </a>
      )}

      {media?.gallery_urls && media.gallery_urls.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">ภาพประกอบ</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.gallery_urls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="rounded-lg border border-slate-200 object-cover" />
            ))}
          </div>
        </div>
      )}

      {media?.files && media.files.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase text-slate-400">ไฟล์ดาวน์โหลด</p>
          <ul className="space-y-1 text-sm">
            {media.files.map((f) => (
              <li key={f.url}>
                <a href={downloadHref(f.url)} className="text-blue-600 hover:underline">
                  {f.name}
                </a>{" "}
                <span className="text-xs text-slate-400">({Math.round(f.size / 1024)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4 text-xs text-slate-400">
        <span>เข้าชม {(pub.view_count ?? 0) + 1} ครั้ง</span>
        <span>ดาวน์โหลด {pub.download_count ?? 0} ครั้ง</span>
        {pub.doi && (
          <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            DOI: {pub.doi}
          </a>
        )}
      </div>
    </div>
  );
}
