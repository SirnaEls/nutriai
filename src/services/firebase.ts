import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import Constants from "expo-constants";

// Configuration Firebase
// Les clés sont chargées depuis les variables d'environnement (EAS) ou app.config.ts
// ⚠️ IMPORTANT: En production, les clés doivent être définies via EAS secrets
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || Constants.expoConfig?.extra?.firebaseAppId,
};

// Vérifier que la configuration est complète
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Configuration Firebase manquante. Vérifiez les variables d'environnement.");
}

// Initialiser Firebase (une seule fois)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Services Firebase
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;

