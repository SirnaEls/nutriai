import { create } from "zustand";
import { User } from "firebase/auth";
import { signUp, signIn, logout, onAuthStateChange, getCurrentUser, signInWithApple } from "../services/auth";
import { getUserProfile, saveUserProfile, subscribeToUserProfile } from "../services/database";
import { logger } from "../utils/logger";
import type { UserProfile } from "./profile";

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

let profileUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,

  signUp: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true });
    try {
      const user = await signUp(email, password, displayName);
      set({ user, isLoading: false });
      
      // Charger le profil après inscription
      await get().refreshProfile();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await signIn(email, password);
      set({ user, isLoading: false });
      
      // Charger le profil après connexion
      await get().refreshProfile();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      const user = await signInWithApple();
      set({ user, isLoading: false });
      
      // Charger le profil après connexion
      await get().refreshProfile();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await logout();
      
      // Désabonner du profil
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }
      
      set({ user: null, profile: null, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ profile: null });
      return;
    }

    try {
      // Charger le profil initial
      const profile = await getUserProfile(user.uid);
      set({ profile });

      // S'abonner aux changements du profil
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      profileUnsubscribe = subscribeToUserProfile(user.uid, (updatedProfile) => {
        set({ profile: updatedProfile });
      });
    } catch (error) {
      logger.error("Erreur chargement profil:", error);
    }
  },
}));

// Initialiser l'état d'authentification au démarrage
onAuthStateChange((user) => {
  useAuthStore.setState({ user, isInitialized: true });
  
  if (user) {
    // Charger le profil si l'utilisateur est connecté
    useAuthStore.getState().refreshProfile();
    
    // Charger le profil depuis Firebase dans le store profile
    import("../store/profile").then(({ useProfileStore }) => {
      useProfileStore.getState().loadProfile(user.uid).catch((err) => logger.error("Erreur chargement profil:", err));
    });
    
    // Charger les messages de chat depuis Firebase
    import("../store/chat").then(({ useChatStore }) => {
      useChatStore.getState().loadMessages(user.uid).catch((err) => logger.error("Erreur chargement messages:", err));
    });
    
    // Charger les entrées de repas depuis Firebase
    import("../store/food").then(({ useFoodStore }) => {
      useFoodStore.getState().loadFoodEntries(user.uid).catch((err) => logger.error("Erreur chargement repas:", err));
    });
    
    // Charger les entrées de poids depuis Firebase
    import("../store/weight").then(({ useWeightStore }) => {
      useWeightStore.getState().loadWeights(user.uid).catch((err) => logger.error("Erreur chargement poids:", err));
    });
  } else {
    // Nettoyer le profil si déconnecté
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = null;
    }
    useAuthStore.setState({ profile: null });
    
    // Nettoyer le profil local
    import("../store/profile").then(({ useProfileStore }) => {
      useProfileStore.getState().resetProfile();
    });
    
    // Nettoyer les messages de chat
    import("../store/chat").then(({ useChatStore }) => {
      useChatStore.getState().clearMessages();
    });
    
    // Nettoyer les entrées de repas
    import("../store/food").then(({ useFoodStore }) => {
      useFoodStore.getState().clearFoodEntries();
    });
    
    // Nettoyer les entrées de poids
    import("../store/weight").then(({ useWeightStore }) => {
      useWeightStore.getState().clearWeights();
    });
  }
});

