# Intégration avec les balances connectées et services de santé

## Options disponibles pour récupérer les données de poids

### 1. **Apple HealthKit (iOS)** ✅ Recommandé pour iOS

**Avantages :**
- Accès direct aux données de poids depuis HealthKit
- Compatible avec toutes les balances connectées iOS (Withings, Fitbit, etc.)
- Les données sont centralisées dans HealthKit
- Pas besoin de se connecter à chaque marque de balance

**Installation :**
```bash
npm install react-native-health
```

**Configuration :**
- Ajoutez les permissions HealthKit dans `app.json`
- Demandez les permissions à l'utilisateur
- Lisez les données de poids depuis HealthKit

**Exemple de code :**
```typescript
import AppleHealthKit from 'react-native-health';

// Demander les permissions
AppleHealthKit.initHealthKit({
  permissions: {
    read: ['Weight'],
  }
}, (error) => {
  if (error) {
    console.log('Error initializing HealthKit:', error);
    return;
  }
  
  // Lire le poids
  AppleHealthKit.getLatestWeight({}, (err, results) => {
    if (err) return;
    console.log('Latest weight:', results.value);
  });
});
```

### 2. **Google Fit (Android)** ✅ Recommandé pour Android

**Avantages :**
- Accès aux données de poids depuis Google Fit
- Compatible avec toutes les balances connectées Android
- Données centralisées

**Installation :**
```bash
npm install react-native-google-fit
```

**Configuration :**
- Configurez OAuth 2.0 avec Google
- Demandez les permissions
- Lisez les données de poids

### 3. **API spécifiques par marque**

#### **Withings**
- API officielle disponible
- Nécessite OAuth et clé API
- Documentation : https://developer.withings.com/

#### **Fitbit**
- API disponible
- Nécessite OAuth
- Documentation : https://dev.fitbit.com/

#### **Xiaomi Mi Scale**
- Pas d'API officielle
- Peut être connecté via HealthKit/Google Fit

### 4. **Expo Health (Cross-platform)** ⚠️ En développement

Expo travaille sur un module Health universel, mais il n'est pas encore disponible.

## Recommandation pour votre app

### Solution recommandée : **HealthKit (iOS) + Google Fit (Android)**

1. **iOS** : Utiliser `react-native-health` pour HealthKit
2. **Android** : Utiliser `react-native-google-fit` pour Google Fit
3. **Fallback** : Permettre la saisie manuelle si les services ne sont pas disponibles

### Implémentation suggérée

1. Créer un store pour les données de poids :
```typescript
// src/store/weight.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WeightEntry = {
  date: string;
  weight: number;
  source: 'manual' | 'healthkit' | 'googlefit';
};

export const useWeightStore = create(
  persist(
    (set) => ({
      entries: [] as WeightEntry[],
      addWeight: (weight: number, source: 'manual' | 'healthkit' | 'googlefit') => {
        const entry: WeightEntry = {
          date: new Date().toISOString(),
          weight,
          source,
        };
        set((state) => ({
          entries: [...state.entries, entry].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        }));
      },
      syncFromHealthKit: async () => {
        // Implémenter la sync depuis HealthKit
      },
    }),
    { name: 'weight-data', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

2. Créer un service pour HealthKit/Google Fit :
```typescript
// src/services/health.ts
import { Platform } from 'react-native';

export async function syncWeightFromHealthServices() {
  if (Platform.OS === 'ios') {
    // Sync depuis HealthKit
  } else if (Platform.OS === 'android') {
    // Sync depuis Google Fit
  }
}
```

3. Ajouter un bouton "Sync" dans l'écran de suivi pour synchroniser les données

## Étapes pour implémenter

1. **Installer les dépendances** :
   ```bash
   npm install react-native-health react-native-google-fit
   ```

2. **Configurer les permissions** dans `app.json`

3. **Créer le service de sync** dans `src/services/health.ts`

4. **Intégrer dans l'écran de suivi** avec un bouton de synchronisation

5. **Ajouter un écran de paramètres** pour gérer les connexions

## Alternative simple (sans intégration)

Pour l'instant, vous pouvez permettre à l'utilisateur de saisir son poids manuellement dans l'écran de suivi. C'est plus simple et fonctionne sur toutes les plateformes.

Souhaitez-vous que j'implémente une de ces solutions ?

