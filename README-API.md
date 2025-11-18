# Configuration de l'API OpenAI pour l'analyse nutritionnelle

## Pourquoi utiliser OpenAI ?

L'API OpenAI permet d'analyser les descriptions de repas en langage naturel et de retourner des données nutritionnelles précises. Cela résout le problème des calculs incorrects (ex: "1 kcal pour 1 banane").

## Configuration

### 1. Obtenir une clé API OpenAI

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com)
2. Allez dans [API Keys](https://platform.openai.com/api-keys)
3. Créez une nouvelle clé API
4. Copiez la clé (elle commence par `sk-`)

### 2. Configurer la clé dans le projet

#### Option A : Fichier .env (Recommandé)

1. Créez un fichier `.env` à la racine du projet (copiez `.env.example`)
2. Ajoutez votre clé :

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-cle-api-ici
```

3. Redémarrez le serveur Expo : `npm start`

#### Option B : app.config.js

Modifiez `app.config.js` :

```javascript
extra: {
  openaiApiKey: "sk-votre-cle-api-ici",
}
```

⚠️ **Important** : Ne commitez JAMAIS votre clé API dans Git ! Le fichier `.env` est déjà dans `.gitignore`.

## Fonctionnement

- **Avec clé API** : Utilise GPT-4o-mini pour analyser les repas et retourner des calories précises
- **Sans clé API** : Utilise un système de fallback basique (moins précis)

## Coûts

- **GPT-4o-mini** : ~$0.15 par million de tokens d'entrée, ~$0.60 par million de tokens de sortie
- Pour une analyse de repas typique : environ $0.001-0.002 par requête
- Avec 1000 analyses par mois : environ $1-2

## Alternatives gratuites

Si vous préférez ne pas utiliser OpenAI, vous pouvez :

1. **OpenFoodFacts API** (gratuit, pas de clé nécessaire)
2. **USDA FoodData Central** (gratuit, pas de clé nécessaire)
3. Améliorer la base de données locale dans `src/services/nutrition.ts`

Pour utiliser ces alternatives, modifiez `src/services/nutrition-ai.ts` pour appeler ces APIs à la place.

