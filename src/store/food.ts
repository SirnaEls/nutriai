import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ParseResponse } from "../domain/types";
import { useAuthStore } from "./auth";
import { addFoodEntry, deleteFoodEntry, getAllFoodEntries } from "../services/database";
import { logger } from "../utils/logger";

type DayKey = string;
type Entry = ParseResponse & { id: string; createdAt: string; firebaseId?: string };

type State = { byDay: Record<DayKey, Entry[]> };
type Actions = {
  addFromParse: (p: ParseResponse) => Promise<void>;
  remove: (day: DayKey, id: string) => Promise<void>;
  loadFoodEntries: (userId: string) => Promise<void>;
  clearFoodEntries: () => void;
};

export const useFoodStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      byDay: {},
      addFromParse: async (p) => {
        const day = new Date().toISOString().slice(0, 10);
        const entry: Entry = {
          ...p,
          id: (global as any).crypto?.randomUUID?.() ?? String(Math.random()),
          createdAt: new Date().toISOString(),
        };
        
        // Sauvegarder localement
        set((s) => {
          const arr = s.byDay[day] ?? [];
          return { byDay: { ...s.byDay, [day]: [entry, ...arr] } };
        });

        // Sauvegarder dans Firebase si l'utilisateur est connecté
        try {
          const { user } = useAuthStore.getState();
          if (user) {
            const firebaseId = await addFoodEntry(user.uid, p);
            // Mettre à jour l'entrée avec l'ID Firebase
            set((s) => ({
              byDay: {
                ...s.byDay,
                [day]: s.byDay[day]?.map((e) =>
                  e.id === entry.id ? { ...e, firebaseId } : e
                ) ?? [entry],
              },
            }));
          }
        } catch (error) {
          logger.error("Erreur sauvegarde repas Firebase:", error);
          // On continue même si Firebase échoue (offline-first)
        }
      },
      remove: async (day, id) => {
        const entry = get().byDay[day]?.find((e) => e.id === id);
        
        // Supprimer localement
        set((s) => ({
          byDay: {
            ...s.byDay,
            [day]: (s.byDay[day] ?? []).filter((e) => e.id !== id),
          },
        }));

        // Supprimer dans Firebase si l'entrée a un ID Firebase
        if (entry?.firebaseId) {
          try {
            await deleteFoodEntry(entry.firebaseId);
          } catch (error) {
            logger.error("Erreur suppression repas Firebase:", error);
          }
        }
      },
      loadFoodEntries: async (userId: string) => {
        try {
          const firebaseEntries = await getAllFoodEntries(userId);
          
          // Convertir les entrées Firebase en format Entry et grouper par jour
          const entriesByDay: Record<DayKey, Entry[]> = {};
          
          firebaseEntries.forEach((firebaseEntry) => {
            const day = firebaseEntry.day || (firebaseEntry.createdAt && typeof firebaseEntry.createdAt.toDate === 'function' 
              ? firebaseEntry.createdAt.toDate().toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10));
            
            // Convertir createdAt Timestamp en string ISO
            let createdAtString: string;
            if (firebaseEntry.createdAt) {
              if (typeof firebaseEntry.createdAt.toDate === 'function') {
                createdAtString = firebaseEntry.createdAt.toDate().toISOString();
              } else if (firebaseEntry.createdAt.toMillis) {
                createdAtString = new Date(firebaseEntry.createdAt.toMillis()).toISOString();
              } else {
                createdAtString = new Date().toISOString();
              }
            } else {
              createdAtString = new Date().toISOString();
            }
            
            const entry: Entry = {
              meal: firebaseEntry.meal,
              items: firebaseEntry.items,
              totalKcal: firebaseEntry.totalKcal,
              summary: firebaseEntry.summary,
              id: firebaseEntry.id,
              createdAt: createdAtString,
              firebaseId: firebaseEntry.id,
            };
            
            if (!entriesByDay[day]) {
              entriesByDay[day] = [];
            }
            entriesByDay[day].push(entry);
          });
          
          // Remplacer les données locales par celles de Firebase
          set({ byDay: entriesByDay });
          
          logger.log(`Chargé ${firebaseEntries.length} entrées de repas depuis Firebase`);
        } catch (error) {
          logger.error("Erreur chargement repas Firebase:", error);
          // En cas d'erreur, on garde les données locales
        }
      },
      clearFoodEntries: () => {
        set({ byDay: {} });
        // Nettoyer aussi AsyncStorage
        AsyncStorage.removeItem("food-entries").catch((err) => logger.error("Erreur suppression repas:", err));
      },
    }),
    {
      name: "food-entries",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
