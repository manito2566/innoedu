import type { InnovationCategory, InnovationLevel } from "@/types";

export interface CategoryDef {
  id: InnovationCategory;
  name_th: string;
  name_en: string;
  description_th: string;
  keywords: string[];
}

export interface LevelDef {
  id: InnovationLevel;
  name_th: string;
  name_en: string;
  description_th: string;
}

// Dimension 1: type of innovation.
// Source: OECD/Eurostat, Oslo Manual (4th ed., 2018) — product, process,
// organisational, marketing innovation — adapted to education by
// OECD/CERI, Measuring Innovation in Education (2014, 2019, 2023), which
// reframes "marketing" as "external relations" for education providers.
export const CATEGORIES: CategoryDef[] = [
  {
    id: "product_service",
    name_th: "นวัตกรรมผลิตภัณฑ์/บริการ (Product/Service)",
    name_en: "Product/Service Innovation",
    description_th:
      "หลักสูตร ตำรา สื่อการสอน วิธีสอนหรือ pedagogy ใหม่ เช่น e-learning, รูปแบบการเรียนรู้ใหม่",
    keywords: [
      "curriculum", "textbook", "learning model", "instructional model",
      "teaching method", "pedagog", "e-learning", "online learning",
      "digital learning", "learning program", "instructional strategy",
      "learning package", "หลักสูตร", "สื่อการสอน", "รูปแบบการเรียน",
      "รูปแบบการสอน", "นวัตกรรมการเรียนรู้", "การจัดการเรียนรู้",
    ],
  },
  {
    id: "process",
    name_th: "นวัตกรรมกระบวนการ (Process)",
    name_en: "Process Innovation",
    description_th:
      "กระบวนการจัดการเรียนรู้ วิธีทำงานของครู การจัดกลุ่มผู้เรียน กระบวนการวัดและประเมินผล",
    keywords: [
      "process", "workflow", "assessment", "evaluation", "measurement",
      "instructional process", "collaborative learning", "active learning",
      "flipped classroom", "STEM", "inquiry-based", "problem-based",
      "กระบวนการ", "การประเมิน", "การวัดผล", "การจัดกลุ่ม",
    ],
  },
  {
    id: "organisational",
    name_th: "นวัตกรรมองค์กร (Organisational)",
    name_en: "Organisational Innovation",
    description_th:
      "โครงสร้างองค์กร การบริหารบุคลากร การประกันคุณภาพ การจัดการความรู้",
    keywords: [
      "management model", "administration", "quality assurance",
      "quality management", "organizational", "organisational",
      "leadership", "human resource", "knowledge management", "policy model",
      "การบริหาร", "การประกันคุณภาพ", "การจัดการความรู้", "ภาวะผู้นำ",
    ],
  },
  {
    id: "external_relations",
    name_th: "นวัตกรรมความสัมพันธ์ภายนอก (External Relations)",
    name_en: "External-Relations Innovation",
    description_th:
      "ความสัมพันธ์กับผู้ปกครอง สถานประกอบการ เครือข่ายวิจัย ชุมชน",
    keywords: [
      "community", "parent", "partnership", "network", "stakeholder",
      "collaboration model", "outreach", "ชุมชน", "เครือข่าย", "ผู้ปกครอง",
      "ความร่วมมือ",
    ],
  },
];

// Dimension 2: degree of change.
// Source: Christensen, C. M. (1997). The Innovator's Dilemma; adapted to
// education by Serdyukov, P. (2017). Innovation in education: what works,
// what doesn't, and what to do about it? Journal of Research in Innovative
// Teaching & Learning, 10(1), 4-33.
// Deliberately has no keyword list: judging incremental vs. systemic change
// requires reading the paper, so this dimension is always admin-confirmed,
// never auto-suggested.
export const LEVELS: LevelDef[] = [
  {
    id: "sustaining",
    name_th: "การเปลี่ยนแปลงแบบต่อยอด (Sustaining/Evolutionary)",
    name_en: "Sustaining / Evolutionary",
    description_th:
      "ปรับปรุงของเดิมให้ดีขึ้นทีละน้อย เช่น inquiry-based learning หรือใช้เทคโนโลยีเสริมในห้องเรียนเดิม",
  },
  {
    id: "disruptive",
    name_th: "การเปลี่ยนแปลงเชิงระบบ (Disruptive/Revolutionary)",
    name_en: "Disruptive / Revolutionary",
    description_th:
      "เปลี่ยนแปลงเชิงระบบ สร้างรูปแบบใหม่ทั้งหมด เช่น การปฏิรูปหลักสูตรทั้งระบบ หรือ online learning ที่เปลี่ยนโครงสร้างการเรียนรู้",
  },
];

export function getCategory(id: InnovationCategory | null): CategoryDef | null {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getLevel(id: InnovationLevel | null): LevelDef | null {
  return LEVELS.find((l) => l.id === id) ?? null;
}

/**
 * Keyword-matching auto-suggestion for the category dimension only.
 * Returns null when no keyword matches (left unclassified rather than
 * guessing) — case-insensitive substring match against title + source_title.
 */
export function suggestCategory(text: string): InnovationCategory | null {
  const haystack = text.toLowerCase();
  let best: { id: InnovationCategory; hits: number } | null = null;

  for (const cat of CATEGORIES) {
    const hits = cat.keywords.filter((kw) =>
      haystack.includes(kw.toLowerCase())
    ).length;
    if (hits > 0 && (!best || hits > best.hits)) {
      best = { id: cat.id, hits };
    }
  }

  return best?.id ?? null;
}
