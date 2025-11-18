import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "./auth";
import { addWeightEntry, getWeightEntries } from "../services/database";
import { logger } from "../utils/logger";

export type WeightEntry = {
  id: string;
  weight: number;
  date: string; // Format YYYY-MM-DD
  firebaseId?: string;
};

type WeightState = {
  entries: WeightEntry[];
  addWeight: (weight: number, date?: string) => Promise<void>;
  loadWeights: (userId: string) => Promise<void>;
  clearWeights: () => void;
};

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      entries: [],
      addWeight: async (weight: number, date?: string) => {
        const entryDate = date || new Date().toISOString().slice(0, 10);
        
        // Vérifier si une entrée existe déjà pour cette date
        const existingEntry = get().entries.find((e) => e.date === entryDate);
        
        const entry: WeightEntry = existingEntry 
          ? { ...existingEntry, weight } // Mettre à jour l'entrée existante
          : {
              id: (global as any).crypto?.randomUUID?.() ?? String(Math.random()),
              weight,
              date: entryDate,
            };

        // Sauvegarder localement (remplacer si existe, sinon ajouter)
        set((state) => {
          const filtered = state.entries.filter((e) => e.date !== entryDate);
          return {
            entries: [...filtered, entry].sort((a, b) => 
              a.date.localeCompare(b.date)
            ),
          };
        });

        // Sauvegarder dans Firebase si l'utilisateur est connecté
        try {
          const { user } = useAuthStore.getState();
          if (user) {
            const firebaseId = await addWeightEntry(user.uid, weight, entryDate);
            // Mettre à jour l'entrée avec l'ID Firebase
            set((state) => ({
              entries: state.entries.map((e) =>
                e.id === entry.id ? { ...e, firebaseId } : e
              ),
            }));
        }
      } catch (error) {
        logger.error("Erreur sauvegarde poids Firebase:", error);
        // On continue même si Firebase échoue (offline-first)
      }
      },
      loadWeights: async (userId: string) => {
        try {
          const firebaseEntries = await getWeightEntries(userId);

          // Convertir les entrées Firebase en format WeightEntry
          const convertedEntries: WeightEntry[] = firebaseEntries.map((entry) => ({
            id: entry.id,
            weight: entry.weight,
            date: entry.date || (entry.createdAt && typeof entry.createdAt.toDate === 'function' 
              ? entry.createdAt.toDate().toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10)),
            firebaseId: entry.id,
          }));

                // Remplacer les entrées locales par celles de Firebase
                set({ entries: convertedEntries });

                logger.log(`Chargé ${convertedEntries.length} entrées de poids depuis Firebase`);
              } catch (error) {
                logger.error("Erreur chargement poids Firebase:", error);
              }
      },
      clearWeights: () => {
        set({ entries: [] });
        AsyncStorage.removeItem("weight-entries").catch((err) => logger.error("Erreur suppression poids:", err));
      },
    }),
    {
      name: "weight-entries",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

