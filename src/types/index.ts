export type SourceDb = "scopus" | "tci" | "google_scholar" | "other";

export type InnovationCategory =
  | "product_service"
  | "process"
  | "organisational"
  | "external_relations";

export type InnovationLevel = "sustaining" | "disruptive";

export type ClassificationStatus = "unclassified" | "suggested" | "confirmed";

export interface Researcher {
  id: string;
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

export interface Publication {
  id: string;
  researcher_id: string;
  title: string;
  year: number | null;
  pub_type: string;
  source_title: string;
  volume: string;
  issue: string;
  pages: string;
  authors: string;
  citations: number;
  doi: string;
  scopus_url: string;
  eid: string;
  source_db: SourceDb;
  innovation_category: InnovationCategory | null;
  innovation_level: InnovationLevel | null;
  classification_status: ClassificationStatus;
  classification_note: string;
  abstract?: string;
  media?: PublicationMedia;
  view_count?: number;
  download_count?: number;
}

export interface MediaFile {
  name: string;
  url: string;
  size: number;
}

export interface PublicationMedia {
  cover_image_url?: string;
  gallery_urls?: string[];
  video_url?: string;
  files?: MediaFile[];
}

export interface ImportBatch {
  id: string;
  filename: string;
  source_db: SourceDb;
  imported_at: string;
  row_count: number;
}
