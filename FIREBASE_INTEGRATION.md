# Intégration Firebase - Résumé

## ✅ Ce qui a été fait

### 1. Configuration Firebase
- ✅ SDK Firebase installé (`firebase`)
- ✅ Configuration dans `src/services/firebase.ts`
- ✅ Variables d'environnement configurées dans `app.config.js`

### 2. Authentification
- ✅ Service d'authentification (`src/services/auth.ts`)
- ✅ Store d'authentification (`src/store/auth.ts`)
- ✅ Écran de login/signup (`app/login.tsx`)
- ✅ Gestion automatique de l'état d'authentification

### 3. Base de données
- ✅ Service de base de données (`src/services/database.ts`)
- ✅ Collections Firestore :
  - `users` : Profils utilisateurs
  - `foodEntries` : Entrées de repas
  - `chatMessages` : Messages de chat
  - `weightEntries` : Entrées de poids

### 4. Stores mis à jour
- ✅ `profile.ts` : Sauvegarde dans Firebase après chaque modification
- ✅ `food.ts` : Persistance locale (à migrer vers Firebase)
- ✅ `chat.ts` : Persistance locale (à migrer vers Firebase)

## 🔄 À faire maintenant

### 1. Configuration Firebase (dans Firebase Console)

1. **Créer le projet Firebase** (si pas déjà fait)
2. **Activer Authentication** → Email/Password
3. **Créer Firestore Database** → Mode production
4. **Récupérer les clés** → Paramètres projet → App web
5. **Ajouter dans `.env`** :
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   ```

### 2. Règles de sécurité Firestore

Dans Firebase Console > Firestore > Règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /foodEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /weightEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. Migration des stores vers Firebase

**À faire** : Modifier `food.ts` et `chat.ts` pour :
- Sauvegarder dans Firebase lors de l'ajout
- Charger depuis Firebase au démarrage
- Écouter les changements en temps réel
- Garder AsyncStorage comme cache local (offline-first)

### 4. Flow d'onboarding

**À modifier** : Après la création du profil dans `create-profile.tsx` et `select-objective.tsx`, sauvegarder dans Firebase.

## 📝 Structure des données Firestore

### Collection `users`
```typescript
{
  gender: "male" | "female" | null,
  firstName: string,
  height: number | null,
  weight: number | null,
  age: number | null,
  objective: "lose" | "maintain" | "gain" | null,
  updatedAt: Timestamp
}
```

### Collection `foodEntries`
```typescript
{
  userId: string,
  meal: "breakfast" | "lunch" | "dinner" | "snack",
  items: Array<{
    name: string,
    qty: number,
    unit?: "g" | "ml" | "piece",
    kcal: number,
    protein?: number,
    carbs?: number,
    fat?: number,
    fiber?: number
  }>,
  totalKcal: number,
  summary: string,
  day: string, // YYYY-MM-DD
  createdAt: Timestamp
}
```

### Collection `chatMessages`
```typescript
{
  userId: string,
  role: "user" | "assistant",
  content: string,
  timestamp: string,
  parsedData?: {
    meal: string,
    items: Array<...>,
    totalKcal: number,
    summary: string
  },
  createdAt: Timestamp
}
```

### Collection `weightEntries`
```typescript
{
  userId: string,
  weight: number,
  date: string, // YYYY-MM-DD
  createdAt: Timestamp
}
```

## 🚀 Prochaines étapes

1. **Configurer Firebase** (voir `FIREBASE_SETUP.md`)
2. **Tester l'authentification** (créer un compte, se connecter)
3. **Migrer les stores** pour utiliser Firebase
4. **Tester la synchronisation** entre appareils

## 💡 Notes importantes

- **Offline-first** : Les données sont d'abord sauvegardées localement, puis synchronisées avec Firebase
- **Sécurité** : Les règles Firestore garantissent que chaque utilisateur ne peut accéder qu'à ses propres données
- **Performance** : Utilisation de `onSnapshot` pour les mises à jour en temps réel
- **Erreurs** : Gestion des erreurs réseau avec fallback sur AsyncStorage

