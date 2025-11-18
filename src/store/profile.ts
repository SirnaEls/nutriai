import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "./auth";
import { saveUserProfile, getUserProfile } from "../services/database";
import { logger } from "../utils/logger";

export type Gender = "male" | "female";
export type Objective = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type UserProfile = {
  gender: Gender | null;
  firstName: string;
  height: number | null; // en cm
  weight: number | null; // en kg
  age: number | null;
  objective: Objective | null;
  activityLevel: ActivityLevel | null;
};

type ProfileState = {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
  calculateBMR: () => number | null; // Basal Metabolic Rate
  calculateDailyCalories: () => number | null;
  calculateMacros: () => {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null;
};

const initialProfile: UserProfile = {
  gender: null,
  firstName: "",
  height: null,
  weight: null,
  age: null,
  objective: null,
  activityLevel: null,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      updateProfile: async (updates) => {
        const newProfile = { ...get().profile, ...updates };
        set({ profile: newProfile });
        
        // Sauvegarder dans Firebase si l'utilisateur est connecté
        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await saveUserProfile(user.uid, newProfile);
          } catch (error) {
            logger.error("Erreur sauvegarde profil Firebase:", error);
            // On continue même si Firebase échoue (offline-first)
          }
        }
      },
      loadProfile: async (userId: string) => {
        try {
          const firebaseProfile = await getUserProfile(userId);
          if (firebaseProfile) {
            set({ profile: firebaseProfile });
            logger.log("Profil chargé depuis Firebase");
          }
        } catch (error) {
          logger.error("Erreur chargement profil Firebase:", error);
        }
      },
      resetProfile: () => {
        set({ profile: initialProfile });
        // Nettoyer aussi AsyncStorage (Zustand utilise le nom du store)
        AsyncStorage.removeItem("user-profile").catch((err) => logger.error("Erreur suppression profil:", err));
      },
      calculateBMR: () => {
        const { gender, weight, height, age } = get().profile;
        if (!gender || !weight || !height || !age) return null;

        // Formule de Mifflin-St Jeor
        if (gender === "male") {
          return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
        } else {
          return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
        }
      },
      calculateDailyCalories: () => {
        const bmr = get().calculateBMR();
        if (!bmr) return null;
        const { objective, activityLevel } = get().profile;
        if (!objective) return bmr;

        // Facteur d'activité selon le niveau
        const activityFactors: Record<ActivityLevel, number> = {
          sedentary: 1.2,      // Sédentaire
          light: 1.375,        // Légèrement actif
          moderate: 1.55,      // Modérément actif
          active: 1.725,       // Très actif
          very_active: 1.9,    // Extrêmement actif
        };

        // Par défaut, utiliser "moderate" si non défini
        const activityFactor = activityLevel 
          ? activityFactors[activityLevel] 
          : activityFactors.moderate;
        
        let baseCalories = bmr * activityFactor;

        switch (objective) {
          case "lose":
            return Math.round(baseCalories - 500); // Déficit de 500 kcal
          case "gain":
            return Math.round(baseCalories + 500); // Surplus de 500 kcal
          case "maintain":
          default:
            return Math.round(baseCalories);
        }
      },
      calculateMacros: () => {
        const calories = get().calculateDailyCalories();
        const { weight, objective } = get().profile;
        if (!calories || !weight) return null;

        // Protéines : 1.4g par kg de poids (recommandation générale) ou 2g (prise de poids)
        const proteinGrams =
          objective === "gain" ? weight * 2 : weight * 1.4;
        const proteinCalories = proteinGrams * 4;

        // Graisses : 25-30% des calories
        const fatCalories = calories * 0.28;
        const fatGrams = fatCalories / 9;

        // Glucides : le reste
        const carbCalories = calories - proteinCalories - fatCalories;
        const carbGrams = carbCalories / 4;

        // Fibres : 25-30g par jour (approximation)
        const fiberGrams = 25;

        return {
          protein: Math.round(proteinGrams),
          carbs: Math.round(carbGrams),
          fat: Math.round(fatGrams),
          fiber: fiberGrams,
        };
      },
    }),
    {
      name: "user-profile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

