# Guide de déploiement en production

## 🗑️ 1. Nettoyer la base de données Firebase

### Option A : Via la console Firebase (recommandé)
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `nutriai-20c35`
3. Allez dans **Firestore Database**
4. Pour chaque collection, supprimez les documents :
   - `users` : Supprimez tous les documents utilisateurs de test
   - `foodEntries` : Supprimez toutes les entrées de repas de test
   - `chatMessages` : Supprimez tous les messages de chat de test
   - `weightEntries` : Supprimez toutes les entrées de poids de test

### Option B : Via un script (si beaucoup de données)
Vous pouvez utiliser la console Firebase ou créer un script Node.js pour supprimer en masse.

## 🔐 2. Configurer les secrets EAS pour la production

Les clés API doivent être stockées comme secrets EAS, pas dans le code :

```bash
# Configurer la clé OpenAI
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "votre-clé-openai"

# Configurer les clés Firebase (optionnel si déjà dans app.config.js)
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "AIzaSyCv6gkbQ3N0zV6s2mi3Bq03C-y3z1TgI5I"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "nutriai-20c35.firebaseapp.com"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "nutriai-20c35"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "nutriai-20c35.firebasestorage.app"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "914143043349"
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:914143043349:web:75e10615a1e9150a56931c"
```

**Note** : Les clés Firebase sont déjà dans `app.config.js`, mais vous pouvez aussi les mettre en secrets pour plus de sécurité.

## 📱 3. Préparer le déploiement iOS

### Prérequis
- Compte développeur Apple (99$/an)
- Certificats et profils de provisioning configurés (EAS les génère automatiquement)

### Mettre à jour eas.json
Remplissez les informations dans `eas.json` :
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "votre-email@apple.com",
      "ascAppId": "", // Laissé vide, sera rempli après la première soumission
      "appleTeamId": "VOTRE_TEAM_ID"
    }
  }
}
```

### Build iOS
```bash
# Build pour iOS
npm run build:ios

# Ou directement avec EAS
eas build --platform ios --profile production
```

### Soumettre à l'App Store
```bash
# Après le build
npm run submit:ios

# Ou directement
eas submit --platform ios --profile production
```

## 🤖 4. Préparer le déploiement Android

### Prérequis
- Compte Google Play Console (25$ une fois)
- Service Account Key pour l'automatisation

### Créer un Service Account Key
1. Allez dans [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un Service Account avec les permissions Play Console
3. Téléchargez le fichier JSON
4. Placez-le dans `./service-account-key.json` (déjà dans .gitignore)

### Build Android
```bash
# Build pour Android (AAB pour Play Store)
npm run build:android

# Ou directement
eas build --platform android --profile production
```

### Soumettre à Google Play
```bash
# Après le build
npm run submit:android

# Ou directement
eas submit --platform android --profile production
```

## 🚀 5. Build pour les deux plateformes

```bash
# Build iOS et Android en même temps
npm run build:all

# Puis soumettre
npm run submit:ios
npm run submit:android
```

## ✅ 6. Checklist avant le déploiement

- [ ] Base de données Firebase nettoyée
- [ ] Secrets EAS configurés (OpenAI API key)
- [ ] `app.config.js` vérifié (version, bundle ID, etc.)
- [ ] `eas.json` configuré avec les bonnes informations
- [ ] Service Account Key Android créé et placé
- [ ] Compte développeur Apple configuré
- [ ] Compte Google Play configuré
- [ ] Testé l'app en mode production localement
- [ ] Vérifié que toutes les fonctionnalités marchent

## 📝 7. Notes importantes

- **Version** : Incrémentez `version` dans `app.config.js` et `buildNumber`/`versionCode` pour chaque nouvelle version
- **Secrets** : Ne jamais commiter les clés API dans le code
- **Firebase** : Les règles de sécurité Firestore doivent être configurées (voir `FIRESTORE_RULES.md`)
- **Test** : Testez toujours en mode preview avant la production

## 🔄 8. Mise à jour après déploiement

Pour mettre à jour l'app après le premier déploiement :

1. Incrémentez la version dans `app.config.js`
2. Incrémentez `buildNumber` (iOS) et `versionCode` (Android)
3. Faites un nouveau build
4. Soumettez à nouveau

```bash
# Exemple pour version 1.0.1
# Dans app.config.js : version: "1.0.1", buildNumber: "2", versionCode: 2
npm run build:all
npm run submit:ios
npm run submit:android
```
