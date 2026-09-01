import { getDb } from "@/lib/firebaseAdmin";
import type { Publication, Researcher } from "@/types";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

function toResearcher(doc: QueryDocumentSnapshot<DocumentData>): Researcher {
  return { id: doc.id, ...(doc.data() as Omit<Researcher, "id">) };
}

function toPublication(doc: QueryDocumentSnapshot<DocumentData>): Publication {
  return { id: doc.id, ...(doc.data() as Omit<Publication, "id">) };
}

export async function getAllResearchers(): Promise<Researcher[]> {
  const snap = await getDb().collection("researchers").orderBy("name_th").get();
  return snap.docs.map(toResearcher);
}

export async function getResearcher(id: string): Promise<Researcher | null> {
  const doc = await getDb().collection("researchers").doc(id).get();
  return doc.exists ? toResearcher(doc as QueryDocumentSnapshot<DocumentData>) : null;
}

export async function getAllPublications(): Promise<Publication[]> {
  const snap = await getDb().collection("publications").get();
  return snap.docs.map(toPublication);
}

export async function getPublicationsForResearcher(
  researcherId: string
): Promise<Publication[]> {
  const snap = await getDb()
    .collection("publications")
    .where("researcher_id", "==", researcherId)
    .get();
  return snap.docs.map(toPublication);
}

export async function getUnconfirmedPublications(): Promise<Publication[]> {
  const snap = await getDb()
    .collection("publications")
    .where("classification_status", "!=", "confirmed")
    .get();
  return snap.docs.map(toPublication);
}

export async function updateClassification(
  publicationId: string,
  data: Partial<
    Pick<
      Publication,
      "innovation_category" | "innovation_level" | "classification_status" | "classification_note"
    >
  >
): Promise<void> {
  await getDb().collection("publications").doc(publicationId).update(data);
}
