# ✅ Checklist Finale - Prêt pour la Production

## 🔐 1. Sécurité Firebase

### Règles Firestore
- [ ] **Copier les règles corrigées** depuis `firestore-rules-corrected.txt` dans Firebase Console
- [ ] **Publier les règles** dans Firebase Console > Firestore Database > Règles
- [ ] **Tester** : Créer un document, lire, modifier, supprimer
- [ ] **Vérifier** : Un utilisateur ne peut pas accéder aux données d'un autre

### Firebase Authentication
- [ ] **Nettoyer les utilisateurs de test** (voir `FIREBASE_CLEANUP_PRODUCTION.md`)
- [ ] **Vérifier** : Supprimer tous les utilisateurs de test via Firebase Console

## 🔑 2. Variables d'environnement EAS

### Secrets EAS (à configurer via `eas secret:create`)
- [ ] `EXPO_PUBLIC_OPENAI_API_KEY` - Clé API OpenAI
- [ ] `EXPO_PUBLIC_FIREBASE_API_KEY` - Clé API Firebase
- [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Domaine Firebase Auth
- [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - ID du projet Firebase
- [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Bucket de stockage
- [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - ID du sender
- [ ] `EXPO_PUBLIC_FIREBASE_APP_ID` - ID de l'app Firebase
- [ ] `EXPO_APPLE_TEAM_ID` - ID de l'équipe Apple (déjà dans eas.json)

**Commandes pour vérifier :**
```bash
eas secret:list
```

## 📱 3. Configuration iOS (App Store)

### App.config.ts
- [x] Version : `1.0.4` ✅
- [x] Build Number : `5` ✅
- [x] Bundle Identifier : `com.ecals.app` ✅
- [x] Icon : `./assets/images/icon.png` ✅
- [x] Splash Screen : Configuré ✅
- [x] `ITSAppUsesNonExemptEncryption: false` ✅

### Icônes et Assets
- [ ] **Vérifier** `icon.png` (1024x1024px) - Utilise le logo avec fond opaque
- [ ] **Vérifier** `splash-icon.png` - Splash screen correct
- [ ] **Tester** l'icône sur un appareil réel avant soumission

### App Store Connect (à faire après le build)
- [ ] **Privacy Policy URL** : Ajouter l'URL de votre politique de confidentialité
- [ ] **Terms of Service URL** : Ajouter l'URL de vos CGU
- [ ] **App Description** : Rédiger en français et anglais
- [ ] **Screenshots** : Préparer pour toutes les tailles d'iPhone requises
- [ ] **Keywords** : Optimiser pour le SEO App Store
- [ ] **Category** : Health & Fitness
- [ ] **Age Rating** : 4+ (pas de contenu sensible)
- [ ] **Support URL** : URL de support client

## 🤖 4. Configuration Android (Google Play)

### App.config.ts
- [x] Package : `com.ecals.app` ✅
- [x] Version Code : `5` ✅
- [x] Adaptive Icon : Configuré ✅

### Google Play Console (à faire après le build)
- [ ] **Privacy Policy URL** : Ajouter l'URL
- [ ] **App Description** : Rédiger
- [ ] **Screenshots** : Préparer pour différentes tailles
- [ ] **Feature Graphic** : 1024x500px
- [ ] **Service Account Key** : Vérifier que `service-account-key.json` existe

## 🧪 5. Tests avant production

### Tests fonctionnels
- [ ] **Inscription** : Créer un nouveau compte
- [ ] **Connexion** : Se connecter avec un compte existant
- [ ] **Profil** : Créer et modifier le profil
- [ ] **Chat IA** : Envoyer un message et recevoir une réponse
- [ ] **Ajout de repas** : Ajouter un repas via le chat
- [ ] **Historique** : Voir l'historique des repas
- [ ] **Poids** : Ajouter et voir l'historique du poids
- [ ] **Navigation** : Tous les écrans fonctionnent

### Tests de sécurité
- [ ] **Authentification** : Impossible d'accéder sans être connecté
- [ ] **Isolation des données** : Un utilisateur ne voit pas les données d'un autre
- [ ] **Règles Firestore** : Toutes les opérations respectent les règles

## 🚀 6. Build et soumission

### Build iOS
```bash
# Build de production
eas build --platform ios --profile production

# Vérifier le build
# Télécharger et installer sur un appareil de test
```

### Build Android
```bash
# Build de production
eas build --platform android --profile production

# Vérifier le build
# Installer sur un appareil de test
```

### Soumission
```bash
# Soumettre iOS à l'App Store
eas submit --platform ios --profile production

# Soumettre Android à Google Play
eas submit --platform android --profile production
```

## 📋 7. Checklist finale avant soumission

### Code
- [x] Pas de `console.log` de debug dans le code ✅
- [x] Logging configuré avec `logger.ts` ✅
- [x] Pas de clés API hardcodées ✅
- [x] Code nettoyé (fichiers inutilisés supprimés) ✅

### Configuration
- [x] `app.config.ts` configuré correctement ✅
- [x] `eas.json` configuré correctement ✅
- [ ] Règles Firestore publiées et testées
- [ ] Secrets EAS configurés

### Assets
- [x] Icônes présentes (icon.png, adaptive-icon.png) ✅
- [x] Splash screen configuré ✅
- [ ] Icônes testées sur appareil réel

### Documentation
- [x] Documentation Firebase créée ✅
- [x] Documentation de nettoyage créée ✅
- [x] Documentation des règles Firestore créée ✅

## ⚠️ Points d'attention

1. **Règles Firestore** : ⚠️ **CRITIQUE** - Assurez-vous d'avoir copié les règles corrigées depuis `firestore-rules-corrected.txt`
2. **Secrets EAS** : Vérifiez que tous les secrets sont configurés avec `eas secret:list`
3. **Test sur appareil réel** : Testez toujours sur un appareil réel avant la soumission
4. **Privacy Policy** : Obligatoire pour l'App Store et Google Play

## 🎯 Commandes rapides

```bash
# Vérifier les secrets EAS
eas secret:list

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Soumettre iOS
eas submit --platform ios --profile production

# Soumettre Android
eas submit --platform android --profile production
```

## ✅ Statut actuel

- ✅ Configuration de base : **PRÊT**
- ⚠️ Règles Firestore : **À PUBLIER** (copier depuis `firestore-rules-corrected.txt`)
- ⚠️ Secrets EAS : **À VÉRIFIER** (utiliser `eas secret:list`)
- ⚠️ Tests : **À FAIRE** (tester sur appareil réel)
- ⚠️ App Store Connect : **À CONFIGURER** (après le build)

---

**🎉 Une fois tous les points cochés, vous êtes prêt pour la production !**

