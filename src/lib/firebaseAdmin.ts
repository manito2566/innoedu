import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "innoedu-local";

function createApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  // Firestore emulator: no real credentials needed, just a project id.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: PROJECT_ID });
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    return initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
      projectId: PROJECT_ID,
    });
  }

  // Falls back to Application Default Credentials (e.g. on Firebase App
  // Hosting, or a local GOOGLE_APPLICATION_CREDENTIALS key file). Must be
  // requested explicitly — initializeApp({projectId}) alone does not
  // auto-discover ADC the way a bare initializeApp() does.
  return initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
}

let firestoreInstance: Firestore | null = null;

export function getDb(): Firestore {
  if (!firestoreInstance) {
    const app = createApp();
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}
