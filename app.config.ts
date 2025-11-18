import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  // Les variables d'environnement sont injectées par EAS au moment du build
  // IMPORTANT: Dans Expo, les variables EXPO_PUBLIC_* sont remplacées par leur valeur
  // littérale dans le code au moment du build. Si la variable n'est pas disponible,
  // elle sera remplacée par undefined dans le code compilé.
  // 
  // Pour les builds EAS, les variables définies via `eas env:create` sont injectées
  // directement dans le bundle JavaScript, donc process.env.EXPO_PUBLIC_* devrait
  // être disponible au runtime dans le code de l'app.
  const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  // Log pour debug (visible dans les logs de build EAS)
  // Note: Ce log s'exécute au moment du build, pas au runtime
  if (!openaiApiKey) {
    console.warn("⚠️ EXPO_PUBLIC_OPENAI_API_KEY n'est pas définie dans app.config.ts au moment du build");
    console.warn("⚠️ La variable sera injectée directement dans le bundle au runtime via EAS");
  } else {
    console.log("✅ EXPO_PUBLIC_OPENAI_API_KEY trouvée dans app.config.ts (longueur:", openaiApiKey.length, ")");
  }
  
  return {
    expo: {
      name: "NutriAI",
      slug: "nutriai",
      version: "1.0.6",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "nutriai",
      userInterfaceStyle: "automatic",
      newArchEnabled: true, // Réactivation de la New Arch comme ce matin
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.ecals.app",
        buildNumber: "9",
        infoPlist: {
          NSHealthShareUsageDescription: "Cette app accède à vos données de poids pour suivre votre progression.",
          NSHealthUpdateUsageDescription: "Cette app enregistre vos données de poids pour suivre votre progression.",
          ITSAppUsesNonExemptEncryption: false, // ✅ ajoute cette ligne
        },
      },
      android: {
        package: "com.ecals.app",
        versionCode: 9,
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        permissions: [
          "android.permission.INTERNET",
        ],
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png",
      },
      plugins: [
        "expo-router",
        [
          "expo-apple-authentication",
          {
            appleTeamId: process.env.EXPO_APPLE_TEAM_ID || "",
          },
        ],
      ],
      experiments: {
        typedRoutes: true,
      },
      extra: {
        // EAS Project ID
        eas: {
          projectId: "45e70399-8a56-4967-ba70-b49a304b6759",
        },
        // Les variables d'environnement sont injectées par EAS au moment du build
        // Elles sont disponibles via process.env.EXPO_PUBLIC_*
        openaiApiKey: openaiApiKey,
        // Configuration Firebase
        firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      },
    },
  } as any;
};
