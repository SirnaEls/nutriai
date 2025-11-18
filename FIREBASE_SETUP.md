# Configuration Firebase

## 📋 Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Suivez les étapes pour créer votre projet

### 2. Activer Authentication

1. Dans Firebase Console, allez dans **Authentication**
2. Cliquez sur **Commencer**
3. Activez **Email/Password** dans l'onglet "Sign-in method"

### 3. Créer une base de données Firestore

1. Dans Firebase Console, allez dans **Firestore Database**
2. Cliquez sur **Créer une base de données**
3. Choisissez **Mode de production** (ou test pour le développement)
4. Sélectionnez une région (ex: `europe-west`)

### 4. Récupérer les clés de configuration

1. Dans Firebase Console, allez dans **Paramètres du projet** (⚙️)
2. Dans l'onglet **Général**, faites défiler jusqu'à "Vos applications"
3. Cliquez sur l'icône **Web** (`</>`) pour créer une app web
4. Donnez un nom à votre app (ex: "ECals")
5. Copiez les valeurs de configuration

### 5. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# OpenAI
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-cle-openai

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre-projet-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Règles de sécurité Firestore

Dans Firebase Console > Firestore Database > Règles, configurez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs : lecture/écriture uniquement pour le propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Entrées de repas : lecture/écriture uniquement pour le propriétaire
    match /foodEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Messages de chat : lecture/écriture uniquement pour le propriétaire
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Entrées de poids : lecture/écriture uniquement pour le propriétaire
    match /weightEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Index Firestore (optionnel mais recommandé)

Pour optimiser les requêtes, créez ces index dans Firestore :

1. **Collection**: `foodEntries`
   - Champs indexés: `userId` (Ascending), `day` (Ascending)

2. **Collection**: `chatMessages`
   - Champs indexés: `userId` (Ascending), `createdAt` (Ascending)

3. **Collection**: `weightEntries`
   - Champs indexés: `userId` (Ascending), `date` (Ascending)

Firebase vous proposera automatiquement de créer ces index lors de la première utilisation.

## 🔐 Sécurité

- ✅ Les règles Firestore garantissent que chaque utilisateur ne peut accéder qu'à ses propres données
- ✅ L'authentification est requise pour toutes les opérations
- ✅ Les variables d'environnement ne sont jamais commitées (déjà dans `.gitignore`)

## 📚 Collections Firestore

L'app utilise ces collections :

1. **`users`** : Profils utilisateurs
   - Document ID = `userId`
   - Champs: `gender`, `firstName`, `height`, `weight`, `age`, `objective`, `updatedAt`

2. **`foodEntries`** : Entrées de repas
   - Champs: `userId`, `meal`, `items[]`, `totalKcal`, `summary`, `day`, `createdAt`

3. **`chatMessages`** : Messages de chat
   - Champs: `userId`, `role`, `content`, `timestamp`, `parsedData`, `createdAt`

4. **`weightEntries`** : Entrées de poids
   - Champs: `userId`, `weight`, `date`, `createdAt`

## 🚀 Test

Après configuration, testez :

1. Créer un compte
2. Se connecter
3. Ajouter un repas
4. Vérifier dans Firebase Console que les données sont bien sauvegardées

