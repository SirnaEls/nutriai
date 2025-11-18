import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "./auth";
import { addChatMessage, getChatMessages } from "../services/database";
import { logger } from "../utils/logger";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  firebaseId?: string;
  parsedData?: {
    meal: string;
    items: Array<{ name: string; qty: number; kcal: number }>;
    totalKcal: number;
    summary: string;
  };
};

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (role: "user" | "assistant", content: string, parsedData?: ChatMessage["parsedData"]) => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  loadMessages: (userId: string) => Promise<void>;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      addMessage: async (role, content, parsedData) => {
        const message: ChatMessage = {
          id: (global as any).crypto?.randomUUID?.() ?? String(Math.random()),
          role,
          content,
          timestamp: new Date().toISOString(),
          parsedData,
        };
        
        // Sauvegarder localement
        set((state) => ({
          messages: [...state.messages, message],
        }));

        // Sauvegarder dans Firebase si l'utilisateur est connecté
        try {
          const { user } = useAuthStore.getState();
          if (user) {
            const firebaseId = await addChatMessage(user.uid, {
              role,
              content,
              parsedData,
            });
            // Mettre à jour le message avec l'ID Firebase
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === message.id ? { ...m, firebaseId } : m
              ),
            }));
          }
        } catch (error) {
          logger.error("Erreur sauvegarde message Firebase:", error);
          // On continue même si Firebase échoue (offline-first)
        }
      },
      setLoading: (loading) => set({ isLoading: loading }),
      clearMessages: () => {
        set({ messages: [] });
        // Nettoyer aussi AsyncStorage
        AsyncStorage.removeItem("chat-messages").catch((err) => logger.error("Erreur suppression messages:", err));
      },
      loadMessages: async (userId: string) => {
        try {
          const firebaseMessages = await getChatMessages(userId);
          
          // Convertir les messages Firebase en format ChatMessage
          const convertedMessages: ChatMessage[] = firebaseMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || (msg.createdAt && typeof msg.createdAt.toDate === 'function' ? msg.createdAt.toDate().toISOString() : new Date().toISOString()) || new Date().toISOString(),
            firebaseId: msg.id,
            parsedData: msg.parsedData,
          }));
          
          // Remplacer les messages locaux par ceux de Firebase
          set({ messages: convertedMessages });
          
          // Le persist middleware de Zustand sauvegardera automatiquement
        } catch (error) {
          logger.error("Erreur chargement messages Firebase:", error);
          // En cas d'erreur, on garde les messages locaux
        }
      },
    }),
    {
      name: "chat-messages",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

