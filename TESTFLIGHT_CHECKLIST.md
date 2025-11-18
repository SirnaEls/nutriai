# 🧪 Checklist TestFlight - Version de Test

## 📋 Différence TestFlight vs Production

- **TestFlight** : Version de test pour valider l'app avant la production
- **Production** : Version publique sur l'App Store

## ✅ 1. Prérequis TestFlight

### Compte Apple Developer
- [x] Compte développeur Apple actif (99$/an)
- [x] Apple Team ID configuré : `5DZ45L2268` ✅
- [x] Apple ID configuré : `nassir.elabbassi@yahoo.fr` ✅

### App Store Connect
- [ ] **Créer l'app dans App Store Connect** (si pas déjà fait)
  - Aller sur [App Store Connect](https://appstoreconnect.apple.com)
  - Cliquer sur "Mes apps" > "+" > "Nouvelle app"
  - Remplir les informations de base
  - Bundle ID : `com.ecals.app`

## 🔐 2. Sécurité Firebase (OBLIGATOIRE)

### Règles Firestore
- [ ] **Copier les règles corrigées** depuis `firestore-rules-corrected.txt`
- [ ] **Publier dans Firebase Console** > Firestore Database > Règles
- [ ] **Tester** : Créer, lire, modifier, supprimer un document

**⚠️ IMPORTANT** : Les règles doivent être publiées avant le build TestFlight !

### Firebase Authentication
- [ ] **Nettoyer les utilisateurs de test** (optionnel pour TestFlight, mais recommandé)
- [ ] **Vérifier** : Supprimer les utilisateurs de test si nécessaire

## 🔑 3. Variables d'environnement EAS

### Vérifier les secrets
```bash
eas secret:list
```

### Secrets requis
- [ ] `EXPO_PUBLIC_OPENAI_API_KEY` - Clé API OpenAI
- [ ] `EXPO_PUBLIC_FIREBASE_API_KEY` - Clé API Firebase
- [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Domaine Firebase Auth
- [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - ID du projet Firebase
- [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Bucket de stockage
- [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - ID du sender
- [ ] `EXPO_PUBLIC_FIREBASE_APP_ID` - ID de l'app Firebase
- [ ] `EXPO_APPLE_TEAM_ID` - ID de l'équipe Apple (déjà dans eas.json)

**Si des secrets manquent :**
```bash
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "votre-clé"
```

## 📱 4. Configuration iOS pour TestFlight

### App.config.ts
- [x] Version : `1.0.4` ✅
- [x] Build Number : `5` ✅ (incrémenter pour chaque build)
- [x] Bundle Identifier : `com.ecals.app` ✅
- [x] Icon : `./assets/images/icon.png` ✅
- [x] Splash Screen : Configuré ✅

### Icônes
- [ ] **Vérifier** `icon.png` (1024x1024px) - Logo avec fond opaque
- [ ] **Vérifier** `splash-icon.png` - Splash screen correct

## 🚀 5. Build pour TestFlight

### Option A : Build de production (recommandé)
```bash
# Build iOS pour TestFlight
eas build --platform ios --profile production
```

### Option B : Build preview (alternative)
```bash
# Build iOS preview
eas build --platform ios --profile preview
```

**Note** : Le profil `production` est recommandé car il génère un build identique à celui de l'App Store.

## 📤 6. Soumettre à TestFlight

### Méthode 1 : Automatique avec EAS Submit
```bash
# Soumettre automatiquement à TestFlight
eas submit --platform ios --profile production
```

### Méthode 2 : Manuel via App Store Connect
1. Aller sur [App Store Connect](https://appstoreconnect.apple.com)
2. Sélectionner votre app
3. Aller dans "TestFlight"
4. Cliquer sur "+" pour ajouter un build
5. Télécharger le fichier `.ipa` depuis EAS
6. Uploader le fichier via Transporter ou Xcode

## 🧪 7. Configuration TestFlight

### Informations de test
- [ ] **What to Test** : Rédiger les instructions pour les testeurs
  - Exemple : "Testez la création de compte, le chat IA, l'ajout de repas..."
- [ ] **Feedback Email** : Email pour recevoir les retours
- [ ] **Build Notes** : Notes sur ce qui a changé dans cette version

### Ajouter des testeurs
- [ ] **Testeurs internes** : Membres de votre équipe (jusqu'à 100)
- [ ] **Testeurs externes** : Utilisateurs externes (jusqu'à 10 000)
  - Nécessite une soumission pour review Apple (24-48h)

## ✅ 8. Checklist avant soumission TestFlight

### Code
- [x] Pas de `console.log` de debug ✅
- [x] Logging configuré ✅
- [x] Pas de clés API hardcodées ✅

### Configuration
- [x] `app.config.ts` configuré ✅
- [x] `eas.json` configuré ✅
- [ ] **Règles Firestore publiées** ⚠️
- [ ] **Secrets EAS configurés** ⚠️

### Assets
- [x] Icônes présentes ✅
- [x] Splash screen configuré ✅

## 🧪 9. Tests sur TestFlight

Une fois le build disponible sur TestFlight :

- [ ] **Installer l'app** sur un appareil iOS réel
- [ ] **Tester l'inscription** : Créer un nouveau compte
- [ ] **Tester la connexion** : Se connecter
- [ ] **Tester le chat IA** : Envoyer un message
- [ ] **Tester l'ajout de repas** : Ajouter via le chat
- [ ] **Tester l'historique** : Voir les repas
- [ ] **Tester le poids** : Ajouter et voir l'historique
- [ ] **Tester la navigation** : Tous les écrans
- [ ] **Tester sur différents appareils** : iPhone, iPad

## 📝 10. Notes de version pour TestFlight

Exemple de "What to Test" :
```
Version 1.0.4 - TestFlight

Nouvelles fonctionnalités :
- Chat IA pour l'analyse nutritionnelle
- Suivi des repas et calories
- Historique du poids
- Profil utilisateur personnalisé

À tester :
1. Création de compte et connexion
2. Chat avec l'IA pour ajouter des repas
3. Visualisation de l'historique
4. Ajout et suivi du poids
5. Navigation entre les écrans

Problèmes connus :
- Aucun pour le moment

Merci pour vos retours !
```

## ⚠️ Points d'attention

1. **Règles Firestore** : ⚠️ **CRITIQUE** - Publier avant le build
2. **Build Number** : Incrémenter à chaque nouveau build (actuellement : 5)
3. **Secrets EAS** : Vérifier avec `eas secret:list`
4. **Test sur appareil réel** : TestFlight nécessite un appareil iOS réel

## 🎯 Commandes rapides

```bash
# Vérifier les secrets
eas secret:list

# Build pour TestFlight
eas build --platform ios --profile production

# Soumettre à TestFlight (automatique)
eas submit --platform ios --profile production

# Vérifier le statut du build
eas build:list
```

## 📊 Workflow complet

1. ✅ Publier les règles Firestore
2. ✅ Vérifier les secrets EAS
3. ✅ Build iOS : `eas build --platform ios --profile production`
4. ✅ Soumettre à TestFlight : `eas submit --platform ios --profile production`
5. ✅ Configurer TestFlight (What to Test, testeurs)
6. ✅ Tester sur appareil réel
7. ✅ Collecter les retours
8. ✅ Corriger les bugs si nécessaire
9. ✅ Rebuild et resoumettre si besoin
10. ✅ Une fois validé → Production App Store

---

**🎉 Une fois TestFlight validé, vous pourrez soumettre à l'App Store !**

