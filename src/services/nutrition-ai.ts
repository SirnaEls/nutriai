import type { ParseResponse, Item } from "../domain/types";
import Constants from "expo-constants";
import { logger } from "../utils/logger";

// Configuration de l'API OpenAI
// La clé API peut être définie via :
// 1. process.env.EXPO_PUBLIC_OPENAI_API_KEY (injecté automatiquement par Expo/EAS dans le bundle)
// 2. Constants.expoConfig?.extra?.openaiApiKey (fallback depuis app.config.ts)
// Note: Dans les builds de production, EXPO_PUBLIC_* est injecté directement dans le bundle JavaScript
const OPENAI_API_KEY = 
  process.env.EXPO_PUBLIC_OPENAI_API_KEY || 
  Constants.expoConfig?.extra?.openaiApiKey ||
  (Constants.expoConfig?.extra as any)?.openaiApiKey;
const USE_AI = !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0;

// Logs de diagnostic (uniquement en développement)
if (!USE_AI) {
  logger.warn("⚠️ OpenAI API key non configurée. Utilisation du mode fallback.");
} else {
  logger.log("✅ OpenAI API key configurée");
}

/**
 * Type pour la réponse conversationnelle avec données structurées
 */
export type ChatResponse = {
  text: string; // Réponse conversationnelle naturelle
  parsedData?: ParseResponse; // Données structurées pour le suivi (si aliments détectés)
};

/**
 * Chat conversationnel avec l'IA (comme ChatGPT) + extraction des données nutritionnelles
 */
export async function chatWithAI(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ChatResponse> {
  // Si pas de clé API, utiliser le fallback
  if (!USE_AI) {
    const parsedData = await analyzeMealFallback(userMessage);
    return {
      text: formatFallbackResponse(parsedData),
      parsedData: parsedData.items.length > 0 ? parsedData : undefined,
    };
  }

  try {
    // D'ABORD extraire les données structurées pour le suivi
    let parsedData: ParseResponse | undefined;
    try {
      parsedData = await extractNutritionData(userMessage);
      // Ne garder que si des aliments ont été détectés
      if (parsedData.items.length === 0) {
        parsedData = undefined;
      }
    } catch (error) {
      logger.warn("Erreur lors de l'extraction des données nutritionnelles:", error);
      // On continue même si l'extraction échoue
    }

    // Si des données ont été extraites, générer un texte cohérent basé sur ces données
    if (parsedData && parsedData.items.length > 0) {
      const formattedText = formatNutritionResponse(parsedData);
      return {
        text: formattedText,
        parsedData,
      };
    }

    // Sinon, faire un appel conversationnel normal (pour les questions générales)
    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un coach nutritionnel personnel expert, bienveillant mais honnête. Tu conseilles, guides et parfois critiques les choix alimentaires pour aider l'utilisateur à atteindre ses objectifs.

Règles importantes :
- Sois CONSEILLANT et ORIENTÉ NUTRITION : analyse la qualité nutritionnelle des aliments
- Sois HONNÊTE : si l'utilisateur mange des aliments peu nutritifs (chips, sodas, fast-food, sucreries, etc.), sois bienveillant mais critique
- Utilise un ton adapté :
  * Pour les bons choix (fruits, légumes, protéines maigres, etc.) : enthousiaste et encourageant 🎉
  * Pour les mauvais choix (junk food, aliments transformés, etc.) : bienveillant mais critique, avec des conseils alternatifs ⚠️
- Sois CONCIS : maximum 3-4 phrases, réponses directes et claires
- Utilise des emojis avec modération (🌿 🍲 🥗 🍎 💪 ⚠️ 🎯 ✨ etc.) - 2-4 emojis par réponse
- Donne des CONSEILS PRATIQUES : suggère des alternatives plus saines quand nécessaire
- Réponds en français de manière naturelle, chaleureuse mais professionnelle
- Exemples de réponses critiques bienveillantes :
  * "Attention, les chips sont très caloriques et peu nutritives... Pourquoi ne pas essayer des légumes croquants avec une sauce légère ? 🥕"
  * "Je comprends l'envie, mais ce type d'aliment n'apporte pas grand-chose nutritionnellement. Une alternative plus équilibrée serait..."`,
          },
          ...conversationHistory,
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7, // Plus créatif pour des réponses naturelles
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text().catch(() => "Unknown error");
      logger.error(`OpenAI API error ${chatResponse.status}:`, errorText);
      throw new Error(`OpenAI API error: ${chatResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const chatData = await chatResponse.json();
    const conversationText = chatData.choices[0]?.message?.content;

    if (!conversationText) {
      throw new Error("No response from OpenAI");
    }

    return {
      text: conversationText,
      parsedData: undefined,
    };
  } catch (error: any) {
    logger.error("Erreur OpenAI:", error);
    
    // Log détaillé de l'erreur pour debug (uniquement en dev)
    const errorMessage = error?.message || String(error);
    const errorStatus = error?.status || (error?.response ? error.response.status : null);
    
    logger.error("Détails erreur OpenAI:", {
      message: errorMessage,
      status: errorStatus,
      hasApiKey: !!OPENAI_API_KEY,
    });
    
    // Si l'erreur est liée à l'authentification (401), c'est probablement un problème de clé API
    if (errorStatus === 401 || errorMessage?.includes("401") || errorMessage?.includes("Unauthorized")) {
      logger.error("Erreur 401: Clé API invalide ou manquante");
      return {
        text: "⚠️ Erreur d'authentification avec l'API OpenAI. Veuillez vérifier la configuration de la clé API.\n\nMode fallback activé (moins précis).",
        parsedData: undefined,
      };
    }
    
    // Fallback sur la méthode locale en cas d'erreur
    const parsedData = await analyzeMealFallback(userMessage);
    return {
      text: formatFallbackResponse(parsedData),
      parsedData: parsedData.items.length > 0 ? parsedData : undefined,
    };
  }
}

/**
 * Extrait les données nutritionnelles structurées d'un message (pour le suivi)
 */
async function extractNutritionData(userMessage: string): Promise<ParseResponse> {
  if (!USE_AI) {
    return analyzeMealFallback(userMessage);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant nutritionnel. Extrait les informations nutritionnelles et retourne UNIQUEMENT un JSON valide :

{
  "meal": "breakfast" | "lunch" | "dinner" | "snack",
  "items": [
    {
      "name": "nom de l'aliment",
      "qty": nombre,
      "unit": "g" | "ml" | "piece" | null,
      "kcal": nombre de calories exact,
      "protein": nombre de grammes de protéines,
      "carbs": nombre de grammes de glucides,
      "fat": nombre de grammes de lipides,
      "fiber": nombre de grammes de fibres (optionnel)
    }
  ],
  "totalKcal": nombre total,
  "summary": "description courte"
}

Règles IMPORTANTES :
- Détecte le type de repas selon le contexte :
  * "breakfast" : petit-déjeuner, matin, café, croissant, pain, céréales, yaourt matinal
  * "lunch" : déjeuner, midi, repas de midi, salade déjeuner
  * "dinner" : dîner, soir, repas du soir, souper
  * "snack" : collation, goûter, encas, grignotage
- Extrait TOUS les aliments mentionnés, même dans les questions
- Calcule les calories ET les macros (protéines, glucides, lipides, fibres) PRÉCISÉMENT
- Les valeurs doivent être EXACTES et correspondre à ce qui sera affiché dans le chat
- IMPORTANT : Les macros doivent être cohérentes avec les calories (1g protéine = 4 kcal, 1g glucide = 4 kcal, 1g lipide = 9 kcal)
- Exemples de macros :
  * 100g haricots verts = 31 kcal, 2g protéines, 7g glucides, 0.2g lipides, 3g fibres
  * 100g riz cuit = 130 kcal, 2.7g protéines, 28g glucides, 0.3g lipides, 0.4g fibres
  * 1 banane = 90 kcal, 1.1g protéines, 23g glucides, 0.3g lipides, 2.6g fibres
  * 50g harcha = ~200 kcal, 7g protéines, 30g glucides, 6g lipides, 2g fibres
- Si c'est une question, traite-la comme si l'utilisateur avait mangé l'aliment
- Retourne UNIQUEMENT le JSON, sans texte`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      logger.error(`OpenAI API error ${response.status}:`, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);

    // Calculer le total des calories si non fourni
    const items = parsed.items?.map((item: any) => ({
      name: item.name || "Aliment",
      qty: item.qty || 1,
      unit: item.unit || undefined,
      kcal: item.kcal || 0,
      protein: item.protein !== undefined ? Number(item.protein) : 0,
      carbs: item.carbs !== undefined ? Number(item.carbs) : 0,
      fat: item.fat !== undefined ? Number(item.fat) : 0,
      fiber: item.fiber !== undefined ? Number(item.fiber) : 0,
    })) || [];
    
    const totalKcal = parsed.totalKcal || items.reduce((sum: number, item: any) => sum + (item.kcal || 0), 0);
    
    return {
      meal: parsed.meal || "snack",
      items,
      totalKcal,
      summary: parsed.summary || userMessage,
    };
  } catch (error) {
    logger.error("Erreur extraction données:", error);
    return analyzeMealFallback(userMessage);
  }
}

/**
 * Formate une réponse nutritionnelle cohérente basée sur les données extraites
 */
function formatNutritionResponse(parsedData: ParseResponse): string {
  const mealLabels: Record<string, string> = {
    breakfast: "petit-déjeuner",
    lunch: "déjeuner",
    dinner: "dîner",
    snack: "collation",
  };

  const mealLabel = mealLabels[parsedData.meal] || "repas";

  // Calculer les totaux de macros
  const totalMacros = parsedData.items.reduce(
    (acc, item) => ({
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
      fiber: acc.fiber + (item.fiber || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Formater les détails des aliments
  const itemsDetails = parsedData.items.map((item) => {
    const qtyText = item.qty && item.unit 
      ? `${item.qty}${item.unit === "piece" ? " pièce" : item.unit}`
      : item.qty 
      ? `${item.qty}g`
      : "";
    
    const itemName = qtyText ? `${item.name} ${qtyText}` : item.name;
    return `• ${itemName} : ${item.kcal || 0} kcal`;
  }).join("\n");

  // Construire la réponse avec enthousiasme et formatage amélioré
  let response = `Super ! Pour ${parsedData.summary.toLowerCase()} :\n\n`;
  
  // Section Calories avec emoji
  response += `📊 Calories : ~${parsedData.totalKcal} kcal\n\n`;
  
  // Section Macros avec formatage visuel amélioré
  response += `💪 Macros :\n`;
  response += `   • Protéines : ${totalMacros.protein.toFixed(1)}g 💪\n`;
  response += `   • Glucides : ${totalMacros.carbs.toFixed(1)}g 🍚\n`;
  response += `   • Lipides : ${totalMacros.fat.toFixed(1)}g 🥑\n`;
  if (totalMacros.fiber > 0) {
    response += `   • Fibres : ${totalMacros.fiber.toFixed(1)}g 🌿\n`;
  }
  
  // Section Détails si plusieurs aliments
  if (parsedData.items.length > 1) {
    response += `\n📋 Détails :\n`;
    parsedData.items.forEach((item) => {
      const qtyText = item.qty && item.unit 
        ? `${item.qty}${item.unit === "piece" ? " pièce" : item.unit}`
        : item.qty 
        ? `${item.qty}g`
        : "";
      const itemName = qtyText ? `${item.name} ${qtyText}` : item.name;
      response += `   • ${itemName} : ${item.kcal || 0} kcal\n`;
    });
  }

  // Analyser la qualité nutritionnelle pour adapter le message
  const hasJunkFood = parsedData.items.some(item => {
    const name = item.name.toLowerCase();
    return name.includes('chips') || name.includes('soda') || name.includes('coca') || 
           name.includes('burger') || name.includes('frites') || name.includes('pizza') ||
           name.includes('bonbon') || name.includes('sucrerie') || name.includes('gâteau') ||
           name.includes('biscuit') || name.includes('chocolat') || name.includes('fast-food');
  });
  
  const hasHealthyFood = parsedData.items.some(item => {
    const name = item.name.toLowerCase();
    return name.includes('fruit') || name.includes('légume') || name.includes('salade') ||
           name.includes('poulet') || name.includes('poisson') || name.includes('yaourt') ||
           name.includes('céréale') || name.includes('noix') || name.includes('avocat');
  });

  // Message adapté selon la qualité nutritionnelle
  if (hasJunkFood && !hasHealthyFood) {
    // Aliments peu nutritifs : message critique mais bienveillant
    const criticalMessages: Record<string, string> = {
      breakfast: `\n⚠️ Attention, ce ${mealLabel} est peu nutritif...\nPourquoi ne pas opter pour des fruits, des céréales complètes ou des protéines ? 🥗`,
      lunch: `\n⚠️ Ce ${mealLabel} n'est pas idéal nutritionnellement...\nJe te conseille d'ajouter des légumes et des protéines maigres pour équilibrer ! 🥕💪`,
      dinner: `\n⚠️ Ce ${mealLabel} manque de nutriments essentiels...\nPense à intégrer plus de légumes et de protéines de qualité ! 🍽️🌿`,
      snack: `\n⚠️ Cette collation est peu nutritive...\nDes fruits, des noix ou un yaourt seraient de meilleurs choix ! 🍎✨`,
    };
    response += criticalMessages[parsedData.meal] || `\n⚠️ Ce repas n'est pas optimal nutritionnellement. Pense à équilibrer avec des aliments plus nutritifs ! 🥗`;
  } else {
    // Bons choix : message encourageant
    const encouragementMessages: Record<string, string> = {
      breakfast: `\nExcellent choix pour ton ${mealLabel} ! 🍳✨\nC'est parti pour une belle journée !`,
      lunch: `\nParfait pour ton ${mealLabel} ! 🥗💪\nTu es sur la bonne voie !`,
      dinner: `\nSuper ${mealLabel} ! 🍽️🌙\nContinue comme ça !`,
      snack: `\nBonne collation ! 🍎✨\nParfait pour maintenir ton énergie !`,
    };
    response += encouragementMessages[parsedData.meal] || `\nC'est un bon choix pour ton ${mealLabel} ! 🍽️✨`;
  }

  return response;
}

/**
 * Formate une réponse pour le fallback
 */
function formatFallbackResponse(parsedData: ParseResponse): string {
  if (parsedData.items.length === 0) {
    return "Je n'ai pas pu identifier d'aliments spécifiques dans votre message. Pourriez-vous être plus précis ? Par exemple : \"J'ai mangé 1 banane et 150g de riz\".";
  }

  const mealNames: Record<string, string> = {
    breakfast: "petit déjeuner",
    lunch: "déjeuner",
    dinner: "diner",
    snack: "collation",
  };

  const mealName = mealNames[parsedData.meal] || parsedData.meal;
  let response = `Alors, pour résumer rapidement, `;
  const itemDescriptions: string[] = [];

  parsedData.items.forEach((item, index) => {
    const qty = item.qty || 1;
    const unit = item.unit ? (item.unit === "g" ? "g" : item.unit === "ml" ? "ml" : "") : "";
    const qtyText = unit ? `${qty}${unit}` : qty > 1 ? `${qty} ${item.name}s` : `1 ${item.name}`;
    
    if (parsedData.items.length > 1 && index === parsedData.items.length - 1) {
      itemDescriptions.push(`et ${qtyText} apporte environ ${item.kcal} calories`);
    } else {
      itemDescriptions.push(`${qtyText} apporte environ ${item.kcal} calories`);
    }
  });

  response += itemDescriptions.join(", ");
  response += `. Donc au total, ça fait à peu près ${parsedData.totalKcal} calories pour ce ${mealName}.`;

  return response;
}

/**
 * Analyse un message utilisateur avec OpenAI pour extraire les informations nutritionnelles
 * @deprecated Utilisez chatWithAI à la place pour une expérience conversationnelle
 */
export async function analyzeMealWithAI(userMessage: string): Promise<ParseResponse> {
  const chatResponse = await chatWithAI(userMessage);
  return chatResponse.parsedData || {
    meal: "snack",
    items: [],
    totalKcal: 0,
    summary: userMessage,
  };
}

/**
 * Fallback : analyse basique sans IA (utilisé si pas de clé API ou en cas d'erreur)
 */
async function analyzeMealFallback(userMessage: string): Promise<ParseResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lowerMessage = userMessage.toLowerCase();
  
  // Détection du repas
  let meal: ParseResponse["meal"] = "snack";
  if (lowerMessage.includes("petit déjeuner") || lowerMessage.includes("matin")) {
    meal = "breakfast";
  } else if (lowerMessage.includes("déjeuner") || lowerMessage.includes("midi")) {
    meal = "lunch";
  } else if (lowerMessage.includes("diner") || lowerMessage.includes("dîner") || lowerMessage.includes("soir")) {
    meal = "dinner";
  }

  // Base de données simplifiée pour le fallback
  const foodDB: Record<string, { kcalPer100g: number; kcalPerUnit?: number; aliases?: string[] }> = {
    pomme: { kcalPer100g: 52, kcalPerUnit: 80, aliases: ["pommes"] },
    banane: { kcalPer100g: 89, kcalPerUnit: 90, aliases: ["bananes"] },
    riz: { kcalPer100g: 130, aliases: ["riz cuit", "riz blanc", "riz complet"] },
    poulet: { kcalPer100g: 165, aliases: ["blanc de poulet", "filet de poulet"] },
    saumon: { kcalPer100g: 208, aliases: ["filet de saumon"] },
    steak: { kcalPer100g: 271, aliases: ["boeuf", "steak haché"] },
    patate: { kcalPer100g: 77, aliases: ["pomme de terre", "patates", "pdt"] },
    haricot: { kcalPer100g: 31, aliases: ["haricots", "haricots verts", "haricot vert"] },
    yaourt: { kcalPer100g: 59, aliases: ["yogourt", "yogurt"] },
    tiramisu: { kcalPer100g: 240 },
    légume: { kcalPer100g: 25, aliases: ["légumes"] },
    salade: { kcalPer100g: 15, aliases: ["laitue"] },
  };

  const items: Item[] = [];
  
  // Extraction simple - chercher aussi dans les questions
  for (const [food, data] of Object.entries(foodDB)) {
    // Vérifier le nom principal et les alias
    const searchTerms = [food, ...(data.aliases || [])];
    const foundTerm = searchTerms.find(term => lowerMessage.includes(term));
    
    if (foundTerm) {
      // Extraire quantité - patterns plus flexibles pour les questions
      const patterns = [
        new RegExp(`(\\d+)\\s*(g|kg|ml)?\\s*(?:de\\s+|d')?${foundTerm.replace(/\s+/g, '\\s+')}`, "i"),
        new RegExp(`${foundTerm.replace(/\s+/g, '\\s+')}\\s*(?:fait|contient|apporte|calories)?\\s*(?:\\s+)?(\\d+)\\s*(g|kg|ml)?`, "i"),
        new RegExp(`(\\d+)\\s*(g|kg|ml)?`, "i"), // Quantité générique avant ou après
      ];
      
      let qtyMatch = null;
      for (const pattern of patterns) {
        qtyMatch = userMessage.match(pattern);
        if (qtyMatch) break;
      }
      
      // Si c'est une question (contient "combien", "calories", etc.), traiter comme 100g par défaut
      const isQuestion = lowerMessage.includes("combien") || lowerMessage.includes("calories") || lowerMessage.includes("calorie");
      const defaultQty = isQuestion ? 100 : 1;
      const defaultUnit = isQuestion ? "g" : null;
      
      const quantity = qtyMatch ? parseInt(qtyMatch[1]) : defaultQty;
      const unit = qtyMatch?.[2] || defaultUnit;
      
      let kcal = 0;
      if (data.kcalPerUnit && (unit === null || unit === "piece")) {
        kcal = data.kcalPerUnit * quantity;
      } else {
        const qtyInG = unit === "kg" ? quantity * 1000 : (unit === "g" || isQuestion ? quantity : quantity * 100);
        kcal = Math.round((data.kcalPer100g * qtyInG) / 100);
      }
      
      // Utiliser le terme trouvé (alias) si disponible, sinon le nom de base
      const displayName = foundTerm !== food ? foundTerm : food;
      
      items.push({
        name: displayName,
        qty: quantity,
        unit: unit as "g" | "ml" | "piece" | undefined,
        kcal,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      name: "Repas",
      qty: 1,
      kcal: 500, // Estimation par défaut
    });
  }

  return {
    meal,
    items,
    totalKcal: items.reduce((sum, item) => sum + (item.kcal || 0), 0),
    summary: userMessage,
  };
}

