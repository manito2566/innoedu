import { createHash } from "node:crypto";
import Papa from "papaparse";
import { suggestCategory } from "@/lib/taxonomy";
import type { Publication, SourceDb } from "@/types";

export function readCsvRows(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const result = Papa.parse<string[]>(clean, { skipEmptyLines: false });
  return result.data as string[][];
}

export function toInt(value: string | undefined): number {
  const n = parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeName(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Deterministic, URL- and Firestore-safe doc id for a researcher without a
 * Scopus id. Hashed rather than transliterated from the Thai name: Next.js
 * (Turbopack dev, 16.3.4) 404s App Router *pages* — though not Route
 * Handlers — for dynamic segments containing non-ASCII characters, so raw
 * Thai text is not safe to use as a URL path segment here.
 */
export function slugifyName(nameTh: string): string {
  const hash = createHash("sha1").update(normalizeName(nameTh)).digest("hex").slice(0, 12);
  return `r-${hash}`;
}

export interface ParsedRosterRow {
  name_th: string;
  name_en: string;
  department: string;
  scopus_id: string | null;
  scopus_url: string | null;
  documents_count: number;
  citations: number;
  h_index: number;
  has_scopus_data: boolean;
}

export function parseResearcherRoster(text: string): ParsedRosterRow[] {
  const rows = readCsvRows(text);
  const headerIdx = rows.findIndex((r) => r[0] === "No.");
  if (headerIdx === -1) throw new Error("Could not find header row ('No.') in roster CSV");

  const dataRows = rows.slice(headerIdx + 1).filter((r) => r.length > 1 && r[0]);

  return dataRows.map((r) => {
    const [, firstnameEn, lastnameEn, nameTh, department, documents, citations, hIndex, scopusId, scopusUrl] = r;
    const nameEn = `${(firstnameEn ?? "").trim()} ${(lastnameEn ?? "").trim()}`.trim();
    return {
      name_th: (nameTh ?? "").trim(),
      name_en: nameEn,
      department: (department ?? "").trim(),
      scopus_id: scopusId?.trim() ? scopusId.trim() : null,
      scopus_url: scopusUrl?.trim() ? scopusUrl.trim() : null,
      documents_count: toInt(documents),
      citations: toInt(citations),
      h_index: toInt(hIndex),
      has_scopus_data: toInt(documents) > 0,
    };
  });
}

export interface ParsedPapersFile {
  scopusId: string | null;
  nameTh: string;
  publications: Omit<Publication, "id" | "researcher_id">[];
}

export function parsePapersCsv(text: string): ParsedPapersFile {
  const rows = readCsvRows(text);

  const metaHeader = rows[0] ?? [];
  const metaData = rows[1] ?? [];
  const nameThIdx = metaHeader.indexOf("นักวิจัย");
  const scopusIdIdx = metaHeader.indexOf("Scopus ID");
  const nameTh = (metaData[nameThIdx] ?? "").trim();
  const scopusId = (metaData[scopusIdIdx] ?? "").trim() || null;

  const tableHeaderIdx = rows.findIndex((r) => r[0] === "Title");
  if (tableHeaderIdx === -1) {
    return { scopusId, nameTh, publications: [] };
  }
  const tableHeader = rows[tableHeaderIdx];
  const dataRows = rows.slice(tableHeaderIdx + 1).filter((r) => r.length > 1 && r[0]);

  const col = (name: string) => tableHeader.indexOf(name);
  const idx = {
    title: col("Title"),
    year: col("Year"),
    type: col("Type"),
    sourceTitle: col("Source Title"),
    volume: col("Volume"),
    issue: col("Issue"),
    pages: col("Pages"),
    authors: col("Authors"),
    citations: col("Citations"),
    doi: col("DOI"),
    scopusUrl: col("Scopus URL"),
    eid: col("EID"),
  };

  const publications = dataRows.map((r) => {
    const title = (r[idx.title] ?? "").trim();
    const sourceTitle = (r[idx.sourceTitle] ?? "").trim();
    const category = suggestCategory(`${title} ${sourceTitle}`);
    const yearNum = parseInt((r[idx.year] ?? "").trim(), 10);
    return {
      title,
      year: Number.isFinite(yearNum) ? yearNum : null,
      pub_type: (r[idx.type] ?? "").trim(),
      source_title: sourceTitle,
      volume: (r[idx.volume] ?? "").trim(),
      issue: (r[idx.issue] ?? "").trim(),
      pages: (r[idx.pages] ?? "").trim(),
      authors: (r[idx.authors] ?? "").trim(),
      citations: toInt(r[idx.citations]),
      doi: (r[idx.doi] ?? "").trim(),
      scopus_url: (r[idx.scopusUrl] ?? "").trim(),
      eid: (r[idx.eid] ?? "").trim(),
      source_db: "scopus" as SourceDb,
      innovation_category: category,
      innovation_level: null,
      classification_status: category ? ("suggested" as const) : ("unclassified" as const),
      classification_note: "",
    } satisfies Omit<Publication, "id" | "researcher_id">;
  });

  return { scopusId, nameTh, publications };
}

/**
 * A stable Firestore doc id for a (researcher, publication) pair, so
 * re-importing the same Scopus export (or an updated one with new rows
 * appended) never creates duplicates. Keyed per researcher, not just per
 * paper, because a paper co-authored by two of our own faculty must still
 * appear as two separate rows — one under each author's record — matching
 * how the Scopus "Documents" count is tallied per person. Falls back to
 * DOI, then a normalized title+year hash for sources with no persistent
 * identifier (TCI, manual entries).
 */
export function publicationDocId(
  pub: { eid?: string; doi?: string; title: string; year: number | null },
  researcherId: string
): string {
  if (pub.eid?.trim()) return `eid-${pub.eid.trim().replace(/[/\\.#$[\]]/g, "_")}-${researcherId}`;
  if (pub.doi?.trim())
    return `doi-${pub.doi.trim().toLowerCase().replace(/[/\\.#$[\]]/g, "_")}-${researcherId}`;
  const norm = normalizeName(pub.title).replace(/[^a-z0-9ก-๙ ]/gi, "").slice(0, 80);
  return `manual-${researcherId}-${pub.year ?? "na"}-${norm}`.replace(/\s+/g, "-");
}
