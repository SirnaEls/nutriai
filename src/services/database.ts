import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { logger } from "../utils/logger";
import type { UserProfile } from "../store/profile";
import type { ParseResponse } from "../domain/types";
import type { ChatMessage } from "../store/chat";

// Collections
const COLLECTIONS = {
  USERS: "users",
  FOOD_ENTRIES: "foodEntries",
  CHAT_MESSAGES: "chatMessages",
  WEIGHT_ENTRIES: "weightEntries",
};

// ==================== PROFIL UTILISATEUR ====================

/**
 * Créer ou mettre à jour le profil utilisateur
 */
export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      ...profile,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    logger.error("Erreur sauvegarde profil:", error);
    throw new Error("Erreur lors de la sauvegarde du profil");
  }
}

/**
 * Récupérer le profil utilisateur
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      // Convertir Timestamp en données normales
      return {
        gender: data.gender || null,
        firstName: data.firstName || "",
        height: data.height || null,
        weight: data.weight || null,
        age: data.age || null,
        objective: data.objective || null,
        activityLevel: data.activityLevel || null,
      };
    }
    return null;
  } catch (error) {
    logger.error("Erreur récupération profil:", error);
    return null;
  }
}

/**
 * Écouter les changements du profil utilisateur
 */
export function subscribeToUserProfile(
  userId: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        gender: data.gender || null,
        firstName: data.firstName || "",
        height: data.height || null,
        weight: data.weight || null,
        age: data.age || null,
        objective: data.objective || null,
        activityLevel: data.activityLevel || null,
      });
    } else {
      callback(null);
    }
  });
}

// ==================== ENTRIES DE REPAS ====================

export type FoodEntry = ParseResponse & {
  id: string;
  userId: string;
  createdAt: Timestamp;
  day: string; // Format YYYY-MM-DD
};

/**
 * Fonction helper pour nettoyer les valeurs undefined d'un objet
 */
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // Nettoyer les éléments du tableau
        cleaned[key] = value.map((item: any) => {
          if (typeof item === 'object' && item !== null) {
            return removeUndefined(item);
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !(value.constructor?.name === 'Timestamp')) {
        // Nettoyer les objets imbriqués (mais pas les Dates ou Timestamps)
        cleaned[key] = removeUndefined(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

/**
 * Ajouter une entrée de repas
 */
export async function addFoodEntry(userId: string, entry: ParseResponse, date?: string): Promise<string> {
  try {
    const day = date || new Date().toISOString().slice(0, 10);
    const entryData: any = {
      meal: entry.meal,
      items: entry.items.map((item) => ({
        name: item.name,
        qty: item.qty,
        ...(item.unit !== undefined && { unit: item.unit }),
        ...(item.kcal !== undefined && { kcal: item.kcal }),
        ...(item.protein !== undefined && { protein: item.protein }),
        ...(item.carbs !== undefined && { carbs: item.carbs }),
        ...(item.fat !== undefined && { fat: item.fat }),
        ...(item.fiber !== undefined && { fiber: item.fiber }),
        ...(item.amount !== undefined && { amount: item.amount }),
      })),
      totalKcal: entry.totalKcal,
      summary: entry.summary,
      userId,
      createdAt: Timestamp.now(),
      day,
    };

    // Nettoyer les valeurs undefined
    const cleanedData = removeUndefined(entryData);

    const docRef = await addDoc(collection(db, COLLECTIONS.FOOD_ENTRIES), cleanedData);
    return docRef.id;
  } catch (error) {
    logger.error("Erreur ajout repas:", error);
    throw new Error("Erreur lors de l'ajout du repas");
  }
}

/**
 * Récupérer les entrées de repas pour un jour
 */
export async function getFoodEntriesByDay(userId: string, day: string): Promise<FoodEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.FOOD_ENTRIES),
      where("userId", "==", userId),
      where("day", "==", day)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodEntry[];
  } catch (error) {
    logger.error("Erreur récupération repas:", error);
    return [];
  }
}

/**
 * Récupérer toutes les entrées de repas d'un utilisateur
 */
export async function getAllFoodEntries(userId: string): Promise<FoodEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.FOOD_ENTRIES),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        meal: data.meal,
        items: data.items,
        totalKcal: data.totalKcal,
        summary: data.summary,
        day: data.day,
        createdAt: data.createdAt,
      };
    }) as FoodEntry[];
  } catch (error) {
    logger.error("Erreur récupération repas:", error);
    return [];
  }
}

/**
 * Supprimer une entrée de repas
 */
export async function deleteFoodEntry(entryId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.FOOD_ENTRIES, entryId));
  } catch (error) {
    logger.error("Erreur suppression repas:", error);
    throw new Error("Erreur lors de la suppression du repas");
  }
}

/**
 * Écouter les entrées de repas pour un jour
 */
export function subscribeToFoodEntries(
  userId: string,
  day: string,
  callback: (entries: FoodEntry[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.FOOD_ENTRIES),
    where("userId", "==", userId),
    where("day", "==", day)
  );

  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FoodEntry[];
    callback(entries);
  });
}

// ==================== MESSAGES DE CHAT ====================

export type ChatMessageDoc = ChatMessage & {
  userId: string;
  createdAt: Timestamp;
};

/**
 * Ajouter un message de chat
 */
export async function addChatMessage(userId: string, message: Omit<ChatMessage, "id" | "timestamp">): Promise<string> {
  try {
    // Nettoyer les champs undefined pour éviter les erreurs Firestore
    const cleanMessage: any = {
      role: message.role,
      content: message.content,
      userId,
      createdAt: Timestamp.now(),
      timestamp: new Date().toISOString(),
    };

    // Ajouter parsedData seulement s'il existe et nettoyer ses valeurs undefined
    if (message.parsedData) {
      cleanMessage.parsedData = {
        meal: message.parsedData.meal,
        items: message.parsedData.items.map((item) => ({
          name: item.name,
          qty: item.qty,
          ...(item.unit !== undefined && { unit: item.unit }),
          ...(item.kcal !== undefined && { kcal: item.kcal }),
          ...(item.protein !== undefined && { protein: item.protein }),
          ...(item.carbs !== undefined && { carbs: item.carbs }),
          ...(item.fat !== undefined && { fat: item.fat }),
          ...(item.fiber !== undefined && { fiber: item.fiber }),
          ...(item.amount !== undefined && { amount: item.amount }),
        })),
        totalKcal: message.parsedData.totalKcal,
        summary: message.parsedData.summary,
      };
    }

    // Nettoyer les valeurs undefined
    const cleanedData = removeUndefined(cleanMessage);

    const docRef = await addDoc(collection(db, COLLECTIONS.CHAT_MESSAGES), cleanedData);
    return docRef.id;
  } catch (error) {
    logger.error("Erreur ajout message:", error);
    throw new Error("Erreur lors de l'ajout du message");
  }
}

/**
 * Récupérer les messages de chat d'un utilisateur
 */
export async function getChatMessages(userId: string): Promise<ChatMessageDoc[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.CHAT_MESSAGES),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp || (data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : new Date().toISOString()) || new Date().toISOString(),
          userId: data.userId,
          createdAt: data.createdAt,
          parsedData: data.parsedData || undefined,
        };
      })
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || new Date(a.timestamp).getTime();
        const bTime = b.createdAt?.toMillis() || new Date(b.timestamp).getTime();
        return aTime - bTime;
      }) as ChatMessageDoc[];
    
    return messages;
  } catch (error) {
    logger.error("Erreur récupération messages:", error);
    return [];
  }
}

/**
 * Écouter les messages de chat
 */
export function subscribeToChatMessages(
  userId: string,
  callback: (messages: ChatMessageDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.CHAT_MESSAGES),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return aTime - bTime;
      }) as ChatMessageDoc[];
    callback(messages);
  });
}

// ==================== POIDS ====================

export type WeightEntry = {
  id: string;
  userId: string;
  weight: number;
  date: string; // Format YYYY-MM-DD
  createdAt: Timestamp;
};

/**
 * Ajouter ou mettre à jour une entrée de poids
 */
export async function addWeightEntry(userId: string, weight: number, date?: string): Promise<string> {
  try {
    const entryDate = date || new Date().toISOString().slice(0, 10);
    
    // Vérifier si une entrée existe déjà pour cette date
    const q = query(
      collection(db, COLLECTIONS.WEIGHT_ENTRIES),
      where("userId", "==", userId),
      where("date", "==", entryDate)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Mettre à jour l'entrée existante
      const existingDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, COLLECTIONS.WEIGHT_ENTRIES, existingDoc.id), {
        weight,
        createdAt: Timestamp.now(),
      });
      return existingDoc.id;
    } else {
      // Créer une nouvelle entrée
      const entryData: Omit<WeightEntry, "id"> = {
        userId,
        weight,
        date: entryDate,
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, COLLECTIONS.WEIGHT_ENTRIES), entryData);
      return docRef.id;
    }
  } catch (error) {
    logger.error("Erreur ajout poids:", error);
    throw new Error("Erreur lors de l'ajout du poids");
  }
}

/**
 * Récupérer les entrées de poids d'un utilisateur
 */
export async function getWeightEntries(userId: string): Promise<WeightEntry[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.WEIGHT_ENTRIES),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          weight: data.weight,
          date: data.date || (data.createdAt && typeof data.createdAt.toDate === 'function' 
            ? data.createdAt.toDate().toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)),
          createdAt: data.createdAt,
        };
      })
      .sort((a, b) => {
        const aDate = a.date || "";
        const bDate = b.date || "";
        return aDate.localeCompare(bDate);
      }) as WeightEntry[];
  } catch (error) {
    logger.error("Erreur récupération poids:", error);
    return [];
  }
}

/**
 * Écouter les entrées de poids
 */
export function subscribeToWeightEntries(
  userId: string,
  callback: (entries: WeightEntry[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.WEIGHT_ENTRIES),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const aDate = a.date || "";
        const bDate = b.date || "";
        return aDate.localeCompare(bDate);
      }) as WeightEntry[];
    callback(entries);
  });
}

