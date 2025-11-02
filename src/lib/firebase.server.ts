// src/lib/firebase.server.ts
import { cert, getApps, initializeApp as initAdmin } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

export function getAdminApp() {
  if (!getApps().length) {
    initAdmin({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // สำคัญ: แปลง \n ให้เป็นบรรทัดจริง
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  }
  return {
    db: getFirestore(),
    bucket: getStorage().bucket(),
  }
}
