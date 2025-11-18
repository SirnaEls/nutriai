# 🚀 Guide de déploiement - Commandes à exécuter

## Étape 1 : Se connecter à EAS

```bash
eas login
```
(Cela ouvrira votre navigateur pour vous connecter)

## Étape 2 : Configurer le secret OpenAI

```bash
eas secret:create --scope project --name EXPO_PUBLIC_OPENAI_API_KEY --value "VOTRE_CLE_OPENAI_ICI"
```

Remplacez `VOTRE_CLE_OPENAI_ICI` par votre vraie clé OpenAI.

## Étape 3 : Build Android

```bash
npm run build:android
```

Cela va :
- Créer un fichier AAB (Android App Bundle)
- Le build prendra environ 10-20 minutes
- Vous recevrez un lien pour suivre la progression

## Étape 4 : Soumettre Android

**IMPORTANT** : Créez d'abord l'application dans Google Play Console si ce n'est pas déjà fait !

```bash
npm run submit:android
```

## Étape 5 : Build iOS (optionnel pour l'instant)

```bash
npm run build:ios
```

## Étape 6 : Soumettre iOS (optionnel)

```bash
npm run submit:ios
```

## ⚠️ Notes importantes

1. **Google Play Console** : Assurez-vous d'avoir créé l'application dans Google Play Console avant de soumettre
2. **Temps de build** : Les builds prennent 10-20 minutes chacun
3. **Suivi** : Vous pouvez suivre la progression sur https://expo.dev
4. **Service Account** : Le fichier `service-account-key.json` est déjà configuré ✅

## 🔍 Vérifications avant de commencer

- [ ] Connecté à EAS (`eas login`)
- [ ] Secret OpenAI configuré
- [ ] Application créée dans Google Play Console (pour Android)
- [ ] Compte Apple Developer configuré (pour iOS)

