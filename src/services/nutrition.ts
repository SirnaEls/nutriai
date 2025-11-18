import type { ParseResponse, Item } from "../domain/types";

// Base de données nutritionnelle améliorée avec valeurs par 100g ou par unité
type FoodEntry = {
  name: string;
  kcalPer100g: number;
  kcalPerUnit?: number; // Pour les aliments vendus à l'unité (banane, pomme, etc.)
  unit?: string; // "piece", "tasse", etc.
  aliases?: string[]; // Noms alternatifs
};

const FOOD_DATABASE: FoodEntry[] = [
  // Fruits
  { name: "banane", kcalPer100g: 89, kcalPerUnit: 90, unit: "piece", aliases: ["bananes"] },
  { name: "pomme", kcalPer100g: 52, kcalPerUnit: 80, unit: "piece", aliases: ["pommes"] },
  { name: "orange", kcalPer100g: 47, kcalPerUnit: 60, unit: "piece", aliases: ["oranges"] },
  { name: "raisin", kcalPer100g: 69, aliases: ["raisins"] },
  
  // Viandes et poissons
  { name: "saumon", kcalPer100g: 208, aliases: ["saumon frais", "filet de saumon"] },
  { name: "poulet", kcalPer100g: 165, aliases: ["blanc de poulet", "filet de poulet", "cuisse de poulet"] },
  { name: "steak", kcalPer100g: 271, aliases: ["boeuf", "steak haché", "viande hachée"] },
  { name: "dinde", kcalPer100g: 189 },
  { name: "porc", kcalPer100g: 242 },
  
  // Céréales et féculents
  { name: "riz", kcalPer100g: 130, aliases: ["riz cuit", "riz blanc", "riz complet"] },
  { name: "pâtes", kcalPer100g: 131, aliases: ["pates", "spaghetti", "nouilles"] },
  { name: "patate", kcalPer100g: 77, aliases: ["pomme de terre", "patates", "pdt"] },
  { name: "patate douce", kcalPer100g: 86, aliases: ["patates douces"] },
  { name: "pain", kcalPer100g: 265, aliases: ["baguette", "tranche de pain"] },
  { name: "quinoa", kcalPer100g: 120 },
  
  // Légumes
  { name: "haricot", kcalPer100g: 31, aliases: ["haricots verts", "haricots"] },
  { name: "légume", kcalPer100g: 25, aliases: ["légumes"] },
  { name: "salade", kcalPer100g: 15, aliases: ["laitue", "salade verte"] },
  { name: "brocoli", kcalPer100g: 34 },
  { name: "carotte", kcalPer100g: 41 },
  { name: "tomate", kcalPer100g: 18 },
  
  // Produits laitiers
  { name: "yaourt", kcalPer100g: 59, aliases: ["yogourt", "yogurt", "yaourts"] },
  { name: "fromage", kcalPer100g: 300, aliases: ["fromages"] },
  { name: "lait", kcalPer100g: 42, aliases: ["lait entier"] },
  { name: "oeuf", kcalPer100g: 155, kcalPerUnit: 70, unit: "piece", aliases: ["oeufs", "œuf", "œufs"] },
  
  // Desserts
  { name: "tiramisu", kcalPer100g: 240 },
  { name: "chocolat", kcalPer100g: 546, aliases: ["chocolat noir"] },
  { name: "gâteau", kcalPer100g: 320, aliases: ["gateau", "gâteaux"] },
  
  // Autres
  { name: "huile", kcalPer100g: 884, aliases: ["huile d'olive", "huile végétale"] },
  { name: "beurre", kcalPer100g: 717 },
  { name: "avocat", kcalPer100g: 160, kcalPerUnit: 240, unit: "piece", aliases: ["avocats"] },
];

// Fonction pour trouver un aliment dans la base de données
function findFood(foodName: string): FoodEntry | null {
  const lowerName = foodName.toLowerCase().trim();
  
  return FOOD_DATABASE.find((food) => {
    if (food.name === lowerName) return true;
    if (food.aliases?.some((alias) => lowerName.includes(alias))) return true;
    if (lowerName.includes(food.name)) return true;
    return false;
  }) || null;
}

// Extraction de quantité depuis le texte
function extractQuantity(text: string, foodName: string): { quantity: number; unit: string | null } {
  const lowerText = text.toLowerCase();
  const lowerFood = foodName.toLowerCase();
  
  // Patterns pour extraire les quantités
  const patterns = [
    // "1 banane", "2 bananes"
    new RegExp(`(\\d+)\\s*(?:${lowerFood}|${lowerFood}s?)\\b`, "i"),
    // "150g de riz", "200 g riz"
    new RegExp(`(\\d+)\\s*(g|kg|ml|l|piece|portion|tasse|cuillère|cuillères)\\s*(?:de\\s+)?${lowerFood}`, "i"),
    // "une banane", "deux bananes"
    new RegExp(`(?:un|une|deux|trois|quatre|cinq)\\s+${lowerFood}`, "i"),
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (!isNaN(num)) {
        const unit = match[2] || null;
        return { quantity: num, unit };
      }
      
      // Gestion des nombres en lettres
      const wordNumbers: Record<string, number> = {
        un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5,
      };
      const wordNum = wordNumbers[match[1]?.toLowerCase()];
      if (wordNum) {
        return { quantity: wordNum, unit: null };
      }
    }
  }
  
  // Si pas de quantité trouvée, chercher un nombre générique avant le nom de l'aliment
  const genericMatch = lowerText.match(new RegExp(`(\\d+)\\s*(g|kg|ml)?\\s*(?:de\\s+)?${lowerFood}`, "i"));
  if (genericMatch) {
    return { quantity: parseInt(genericMatch[1]), unit: genericMatch[2] || null };
  }
  
  // Par défaut : 1 unité ou 100g selon le type d'aliment
  return { quantity: 1, unit: null };
}

// Calcul des calories pour un aliment
function calculateCalories(food: FoodEntry, quantity: number, unit: string | null): number {
  // Si l'aliment a une valeur par unité et que la quantité est en unités
  if (food.kcalPerUnit && (unit === "piece" || unit === null || food.unit === "piece")) {
    return Math.round(food.kcalPerUnit * quantity);
  }
  
  // Sinon, calculer par 100g
  if (unit === "kg") {
    quantity = quantity * 1000; // Convertir kg en g
  }
  
  // Si pas d'unité spécifiée et que l'aliment a une valeur par unité, utiliser ça
  if (!unit && food.kcalPerUnit && quantity <= 5) {
    return Math.round(food.kcalPerUnit * quantity);
  }
  
  // Calcul basé sur 100g
  return Math.round((food.kcalPer100g * quantity) / 100);
}

// Analyse du texte pour extraire les aliments
export async function analyzeMeal(userMessage: string): Promise<ParseResponse> {
  // Simulation d'un délai d'API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lowerMessage = userMessage.toLowerCase();
  
  // Détection du repas
  let meal: ParseResponse["meal"] = "snack";
  if (lowerMessage.includes("petit déjeuner") || lowerMessage.includes("matin") || lowerMessage.includes("breakfast")) {
    meal = "breakfast";
  } else if (lowerMessage.includes("déjeuner") || lowerMessage.includes("midi") || lowerMessage.includes("lunch")) {
    meal = "lunch";
  } else if (lowerMessage.includes("diner") || lowerMessage.includes("dîner") || lowerMessage.includes("soir") || lowerMessage.includes("dinner")) {
    meal = "dinner";
  }

  const items: Item[] = [];
  const foundFoods = new Set<string>();

  // Chercher chaque aliment dans la base de données
  for (const food of FOOD_DATABASE) {
    const foodPattern = new RegExp(`\\b${food.name}\\w*`, "i");
    if (foodPattern.test(userMessage) && !foundFoods.has(food.name)) {
      foundFoods.add(food.name);
      
      const { quantity, unit } = extractQuantity(userMessage, food.name);
      const kcal = calculateCalories(food, quantity, unit);
      
      items.push({
        name: food.name,
        qty: quantity,
        unit: unit as "g" | "ml" | "piece" | undefined,
        kcal,
      });
    }
  }

  // Si aucun aliment trouvé, essayer une approche plus simple
  if (items.length === 0) {
    // Chercher des mots-clés génériques
    const genericWords = ["repas", "manger", "mangé", "déjeuné", "dîné"];
    const hasGenericWord = genericWords.some(word => lowerMessage.includes(word));
    
    if (hasGenericWord) {
      // Estimation basique : un repas moyen fait environ 500-800 kcal
      const estimatedKcal = Math.round(400 + Math.random() * 400);
      items.push({
        name: "Repas",
        qty: 1,
        kcal: estimatedKcal,
      });
    }
  }

  const totalKcal = items.reduce((sum, item) => sum + (item.kcal || 0), 0);

  return {
    meal,
    items,
    totalKcal,
    summary: userMessage,
  };
}

// Option future : intégration avec OpenFoodFacts API (gratuite, pas besoin de clé)
export async function searchFoodAPI(foodName: string): Promise<FoodEntry | null> {
  try {
    // Exemple avec OpenFoodFacts (gratuit, pas besoin de clé API)
    // const response = await fetch(
    //   `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=1`
    // );
    // const data = await response.json();
    // ... traitement des données ...
    
    // Pour l'instant, on utilise la base de données locale
    return findFood(foodName);
  } catch (error) {
    // Les erreurs sont gérées dans le catch
    return findFood(foodName); // Fallback sur la base locale
  }
}

