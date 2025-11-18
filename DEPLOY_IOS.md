# 🍎 Déploiement iOS - Guide rapide

## ✅ Configuration actuelle

Votre `eas.json` est déjà configuré avec :
- `appleId`: nassir.elabbassi@yahoo.fr ✅
- `appleTeamId`: 5DZ45L2268 ✅
- `ascAppId`: (sera rempli automatiquement après la première soumission)

## 📋 Étapes pour déployer sur iOS

### 1. Se connecter à EAS
```bash
eas login
```

### 2. Configurer le secret OpenAI (OBLIGATOIRE)
```bash
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "votre-clé-openai"
```

### 3. Build iOS
```bash
npm run build:ios
```

Cette commande va :
- Créer un fichier IPA pour iOS
- Prendre environ 15-25 minutes
- Générer automatiquement les certificats et profils de provisioning
- Vous donner un lien pour suivre la progression

### 4. Soumettre à l'App Store
```bash
npm run submit:ios
```

## ⚠️ Prérequis iOS

- [ ] Compte développeur Apple actif (99$/an)
- [ ] L'email `nassir.elabbassi@yahoo.fr` doit être associé au compte développeur
- [ ] L'app doit être créée dans App Store Connect (EAS peut le faire automatiquement)

## 🔍 Vérifications

Avant de lancer le build, vérifiez :
- [ ] Connecté à EAS (`eas whoami` doit afficher votre compte)
- [ ] Secret OpenAI configuré
- [ ] Compte Apple Developer actif

## 📱 Après le build

Une fois le build terminé :
1. Vous recevrez un lien pour télécharger l'IPA
2. Vous pouvez le soumettre avec `npm run submit:ios`
3. L'app sera soumise pour review dans l'App Store

## 🚀 Commandes rapides

```bash
# Tout en une fois (après connexion et secret)
eas login
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "VOTRE_CLE"
npm run build:ios
npm run submit:ios
```

