import { createHash } from "node:crypto";
import Papa from "papaparse";
import { suggestCategory } from "@/lib/taxonomy";
import type { Publication } from "@/types";

/**
 * Publish or Perish exports Google Scholar search results as CSV with a
 * fixed header row: Cites, Authors, Title, Year, Source, Publisher,
 * ArticleURL, CitesURL, GSRank, QueryDate, Type, DOI, ISSN, CitationURL,
 * Volume, Issue, StartPage, EndPage, ECC, CitesPerYear, CitesPerAuthor,
 * AuthorCount, Age, Abstract.
 *
 * The "Authors" column lists every co-author on the paper, not just the
 * professor who was searched — a PoP export is one file per search, i.e.
 * per professor — so publications from a PoP file are attributed to a
 * single researcher chosen up front by the admin, not matched by name.
 */
export function parsePublishOrPerishCsv(
  text: string
): Omit<Publication, "id" | "researcher_id">[] {
  const clean = text.replace(/^﻿/, "");
  const parsed = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data
    .filter((row) => (row["Title"] ?? "").trim())
    .map((row) => {
      const title = (row["Title"] ?? "").trim();
      const sourceTitle = (row["Source"] ?? "").trim();
      const yearNum = parseInt((row["Year"] ?? "").trim(), 10);
      const citesNum = parseInt((row["Cites"] ?? "").trim(), 10);
      const category = suggestCategory(`${title} ${sourceTitle}`);

      return {
        title,
        year: Number.isFinite(yearNum) ? yearNum : null,
        pub_type: (row["Type"] ?? "Journal").trim() || "Journal",
        source_title: sourceTitle,
        volume: (row["Volume"] ?? "").trim(),
        issue: (row["Issue"] ?? "").trim(),
        pages: [row["StartPage"], row["EndPage"]].filter(Boolean).join("-"),
        authors: (row["Authors"] ?? "").trim(),
        citations: Number.isFinite(citesNum) ? citesNum : 0,
        doi: (row["DOI"] ?? "").trim(),
        scopus_url: "",
        eid: "",
        source_db: "google_scholar" as const,
        innovation_category: category,
        innovation_level: null,
        classification_status: category ? ("suggested" as const) : ("unclassified" as const),
        classification_note: "",
      } satisfies Omit<Publication, "id" | "researcher_id">;
    });
}

/** Publish or Perish has no persistent id like Scopus EID, so fall back to
 * DOI, then a hash of the title+year, always scoped to the researcher. */
export function scholarPublicationDocId(
  pub: { doi?: string; title: string; year: number | null },
  researcherId: string
): string {
  if (pub.doi?.trim()) {
    return `doi-${pub.doi.trim().toLowerCase().replace(/[/\\.#$[\]]/g, "_")}-${researcherId}`;
  }
  const hash = createHash("sha1")
    .update(`${pub.title.trim().toLowerCase()}|${pub.year ?? "na"}`)
    .digest("hex")
    .slice(0, 16);
  return `gs-${researcherId}-${hash}`;
}
