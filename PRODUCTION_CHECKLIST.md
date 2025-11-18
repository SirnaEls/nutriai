# ✅ Checklist Production - App Store

## 🔒 Sécurité

### ✅ Configuration Firebase
- [x] Clés Firebase retirées du code source (hardcoded)
- [x] Variables d'environnement configurées via EAS
- [x] Vérification de la configuration Firebase au démarrage
- [ ] **À FAIRE** : Vérifier les règles Firestore en production (voir `FIRESTORE_RULES.md`)

### ✅ Secrets et API Keys
- [x] OpenAI API Key gérée via EAS secrets
- [x] Firebase config gérée via variables d'environnement
- [x] Pas de clés hardcodées dans le code

### ✅ Logging
- [x] Système de logging créé (`src/utils/logger.ts`)
- [x] Console.log de debug remplacés par logger
- [x] Logs désactivés en production (uniquement erreurs)

## 🧹 Nettoyage du code

### ✅ Fichiers supprimés
- [x] `app/chat.tsx` (doublon)
- [x] `app/welcome.tsx` (inutilisé)
- [x] `app/(tabs)/two.tsx` (écran de test)
- [x] Routes inutiles nettoyées dans `_layout.tsx`

### ✅ Code refactorisé
- [x] Tous les `console.log/error` remplacés par `logger`
- [x] Imports inutilisés nettoyés
- [x] Code de debug retiré

## 📱 Configuration App Store

### ✅ Version et Build
- [x] Version incrémentée : `1.0.4`
- [x] iOS Build Number : `5`
- [x] Android Version Code : `5`

### ⚠️ À vérifier avant soumission

#### iOS
- [ ] **Privacy Policy URL** : Ajouter dans App Store Connect
- [ ] **Terms of Service URL** : Ajouter dans App Store Connect
- [ ] **App Icon** : Vérifier que `assets/images/icon.png` est correct (1024x1024)
- [ ] **Splash Screen** : Vérifier `assets/images/splash-icon.png`
- [ ] **App Store Description** : Préparer en français et anglais
- [ ] **Screenshots** : Préparer pour iPhone (toutes les tailles requises)
- [ ] **Keywords** : Optimiser pour le SEO App Store
- [ ] **Category** : Health & Fitness
- [ ] **Age Rating** : 4+ (pas de contenu sensible)
- [ ] **Apple Sign-In** : Vérifier que c'est bien configuré dans Xcode

#### Android
- [ ] **Privacy Policy URL** : Ajouter dans Google Play Console
- [ ] **Terms of Service URL** : Ajouter dans Google Play Console
- [ ] **App Icon** : Vérifier `assets/images/adaptive-icon.png`
- [ ] **Feature Graphic** : Créer (1024x500)
- [ ] **Screenshots** : Préparer pour différentes tailles d'écran
- [ ] **App Description** : Préparer en français et anglais
- [ ] **Content Rating** : Questionnaire à remplir dans Google Play Console

## 🗄️ Base de données Firebase

### ⚠️ Recommandation : Créer une nouvelle BDD de production

**Pourquoi ?**
- La BDD actuelle contient probablement des données de test
- Les clés Firebase hardcodées suggèrent une BDD de développement
- Meilleure séparation dev/prod

### Étapes recommandées :

1. **Créer un nouveau projet Firebase pour la production**
   ```bash
   # Dans Firebase Console
   - Créer un nouveau projet : "ecals-prod"
   - Activer Authentication (Email/Password + Apple)
   - Créer Firestore Database (mode production)
   - Configurer les règles de sécurité (voir FIRESTORE_RULES.md)
   ```

2. **Récupérer les nouvelles clés**
   - Paramètres projet → App web
   - Copier les clés de configuration

3. **Mettre à jour les variables EAS**
   ```bash
   eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "nouvelle-cle" --visibility sensitive --environment production
   eas env:create --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "nouveau-domaine" --visibility sensitive --environment production
   eas env:create --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "nouveau-project-id" --visibility sensitive --environment production
   eas env:create --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "nouveau-bucket" --visibility sensitive --environment production
   eas env:create --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "nouveau-sender-id" --visibility sensitive --environment production
   eas env:create --name EXPO_PUBLIC_FIREBASE_APP_ID --value "nouvelle-app-id" --visibility sensitive --environment production
   ```

4. **Configurer les règles Firestore** (voir `FIRESTORE_RULES.md`)

5. **Tester avec la nouvelle BDD**
   - Build de test avec les nouvelles variables
   - Vérifier que tout fonctionne

### Alternative : Nettoyer la BDD actuelle

Si vous préférez garder la même BDD :
1. Supprimer toutes les collections de test
2. Vérifier les règles de sécurité
3. S'assurer que les clés sont bien dans EAS (pas hardcodées)

## 🔍 Tests avant soumission

### Fonctionnalités à tester
- [ ] Inscription/Connexion (Email/Password)
- [ ] Connexion Apple (iOS uniquement)
- [ ] Création de profil
- [ ] Ajout d'aliments via chat
- [ ] Affichage des macros et calories
- [ ] Ajout de poids
- [ ] Courbe de poids
- [ ] Suppression d'aliments
- [ ] Ajout d'aliments sur jours précédents
- [ ] Synchronisation Firebase (déconnexion/reconnexion)

### Tests de performance
- [ ] Temps de chargement de l'app
- [ ] Temps de réponse du chat IA
- [ ] Synchronisation Firebase (rapidité)
- [ ] Gestion offline (mode dégradé)

### Tests de sécurité
- [ ] Pas de données sensibles dans les logs
- [ ] Authentification fonctionne correctement
- [ ] Règles Firestore empêchent l'accès non autorisé

## 📋 Documents nécessaires

### Pour App Store Connect
- [ ] Privacy Policy (URL ou document)
- [ ] Terms of Service (URL ou document)
- [ ] App Description (français + anglais)
- [ ] Keywords
- [ ] Screenshots (toutes les tailles)
- [ ] App Preview Video (optionnel mais recommandé)

### Pour Google Play Console
- [ ] Privacy Policy (URL)
- [ ] App Description (français + anglais)
- [ ] Screenshots
- [ ] Feature Graphic
- [ ] Content Rating (questionnaire)

## 🚀 Commandes de build final

```bash
# Build iOS pour production
eas build --platform ios --profile production

# Build Android pour production
eas build --platform android --profile production

# Soumettre à App Store Connect
eas submit --platform ios --profile production

# Soumettre à Google Play Console
eas submit --platform android --profile production
```

## ⚠️ Points d'attention

1. **OpenAI API Key** : Vérifier qu'elle est bien configurée dans EAS pour la production
2. **Apple Sign-In** : Vérifier la configuration dans Xcode et Firebase
3. **Firestore Rules** : S'assurer qu'elles sont sécurisées (voir `FIRESTORE_RULES.md`)
4. **Rate Limiting** : Considérer l'ajout de rate limiting pour l'API OpenAI
5. **Error Handling** : Tous les cas d'erreur sont gérés avec fallback

## ✅ Statut actuel

**Code** : ✅ Prêt pour production
**Configuration** : ⚠️ Nécessite vérification des variables EAS
**Base de données** : ⚠️ Recommandation de créer une nouvelle BDD prod
**Documentation** : ✅ Checklist complète

## 🎯 Prochaines étapes

1. Créer une nouvelle BDD Firebase de production OU nettoyer l'actuelle
2. Vérifier/créer toutes les variables d'environnement dans EAS
3. Tester un build de production complet
4. Préparer les assets (screenshots, descriptions)
5. Soumettre à App Store Connect et Google Play Console

