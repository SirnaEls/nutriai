import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  deleteUser,
} from "firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { auth } from "./firebase";

// Nécessaire pour expo-auth-session
// Protection contre les crashes TurboModule sur iPad
try {
  WebBrowser.maybeCompleteAuthSession();
} catch (error) {
  console.warn("WebBrowser.maybeCompleteAuthSession failed:", error);
  // Ne pas bloquer l'app si cette initialisation échoue
}

export type AuthUser = User | null;

/**
 * Créer un nouveau compte utilisateur
 */
export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mettre à jour le nom d'affichage si fourni
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    return user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Se connecter avec email/mot de passe
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Se déconnecter
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error("Erreur lors de la déconnexion");
  }
}

/**
 * Supprimer le compte utilisateur actuel
 * ⚠️ L'utilisateur doit être connecté pour supprimer son compte
 */
export async function deleteCurrentUser(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Aucun utilisateur connecté");
    }
    await deleteUser(user);
  } catch (error: any) {
    if (error.code === "auth/requires-recent-login") {
      throw new Error("Vous devez vous reconnecter récemment pour supprimer votre compte");
    }
    throw new Error(error.message || "Erreur lors de la suppression du compte");
  }
}

/**
 * Écouter les changements d'état d'authentification
 */
export function onAuthStateChange(callback: (user: AuthUser) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Obtenir l'utilisateur actuel
 */
export function getCurrentUser(): AuthUser {
  return auth.currentUser;
}

/**
 * Traduire les codes d'erreur Firebase en messages français
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "Cet email est déjà utilisé",
    "auth/invalid-email": "Email invalide",
    "auth/operation-not-allowed": "Opération non autorisée",
    "auth/weak-password": "Le mot de passe est trop faible (minimum 6 caractères)",
    "auth/user-disabled": "Ce compte a été désactivé",
    "auth/user-not-found": "Aucun compte trouvé avec cet email",
    "auth/wrong-password": "Mot de passe incorrect",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard",
    "auth/network-request-failed": "Erreur de connexion réseau",
  };

  return errorMessages[errorCode] || "Une erreur est survenue";
}

/**
 * Se connecter avec Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    if (Platform.OS === "web") {
      // Pour le web, utiliser signInWithPopup (nécessite une fonction séparée)
      // Note: Cette fonction doit être appelée depuis un composant React pour le web
      throw new Error("Google Sign-In sur web nécessite une implémentation spécifique");
    } else {
      // Pour mobile, utiliser expo-auth-session avec Google
      const clientId = Platform.OS === "ios" 
        ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

      if (!clientId) {
        throw new Error("Google Client ID non configuré");
      }

      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        revocationEndpoint: "https://oauth2.googleapis.com/revoke",
      };

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri,
        usePKCE: false,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === "success") {
        const { id_token } = result.params;
        if (!id_token) {
          throw new Error("Token Google non reçu");
        }
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      } else {
        throw new Error("Connexion Google annulée");
      }
    }
  } catch (error: any) {
    throw new Error(error.message || "Erreur lors de la connexion avec Google");
  }
}

/**
 * Se connecter avec Apple
 */
export async function signInWithApple(): Promise<User> {
  try {
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign-In n'est disponible que sur iOS");
    }

    // Vérifier si Apple Authentication est disponible
    // Protection contre les crashes TurboModule sur iPad
    let isAvailable = false;
    try {
      isAvailable = await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      console.warn("AppleAuthentication.isAvailableAsync failed:", error);
      throw new Error("Apple Sign-In n'est pas disponible sur cet appareil");
    }
    
    if (!isAvailable) {
      throw new Error("Apple Sign-In n'est pas disponible sur cet appareil");
    }

    // Demander les informations d'authentification
    // Protection contre les crashes TurboModule sur iPad
    let credential;
    try {
      credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
    } catch (error: any) {
      // Si c'est une annulation utilisateur, la propager
      if (error.code === "ERR_CANCELED") {
        throw new Error("Connexion Apple annulée");
      }
      // Sinon, logger et propager l'erreur
      console.error("AppleAuthentication.signInAsync failed:", error);
      throw error;
    }

    // Créer un credential Firebase avec le token Apple
    const { identityToken, nonce } = credential;
    
    if (!identityToken) {
      throw new Error("Impossible d'obtenir le token d'identité Apple");
    }

    // Créer le provider OAuth pour Apple
    const provider = new OAuthProvider("apple.com");
    const credential_firebase = provider.credential({
      idToken: identityToken,
      rawNonce: nonce || undefined,
    });

    // Se connecter avec Firebase
    const userCredential = await signInWithCredential(auth, credential_firebase);
    const user = userCredential.user;

    // Mettre à jour le profil si c'est une première connexion et qu'on a le nom
    if (credential.fullName && !user.displayName) {
      const displayName = credential.fullName.givenName 
        ? `${credential.fullName.givenName} ${credential.fullName.familyName || ""}`.trim()
        : undefined;
      
      if (displayName) {
        await updateProfile(user, { displayName });
      }
    }

    return user;
  } catch (error: any) {
    if (error.code === "ERR_CANCELED") {
      throw new Error("Connexion Apple annulée");
    }
    throw new Error(error.message || "Erreur lors de la connexion avec Apple");
  }
}

