# Configuration OAuth (Google et Apple)

## 📋 Prérequis

Les packages suivants ont été installés :
- `expo-auth-session` - Pour Google OAuth
- `expo-apple-authentication` - Pour Apple Sign-In
- `expo-crypto` - Pour la génération de nonce

## 🔧 Configuration Firebase

### 1. Activer Google Sign-In dans Firebase

1. Allez dans [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **Sign-in method**
4. Activez **Google** comme méthode de connexion
5. Configurez les domaines autorisés si nécessaire

### 2. Activer Apple Sign-In dans Firebase

1. Dans Firebase Console → **Authentication** → **Sign-in method**
2. Activez **Apple** comme méthode de connexion
3. Configurez les paramètres Apple (nécessite un compte développeur Apple)

## 🔑 Configuration Google OAuth

### 1. Créer les OAuth Client IDs dans Google Cloud Console

1. Allez dans [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet Firebase (ou créez-en un)
3. Allez dans **APIs & Services** → **Credentials**
4. Créez des **OAuth 2.0 Client IDs** pour :
   - **iOS** : Type "iOS", Bundle ID de votre app (`com.ecals.app`)
   - **Android** : Type "Android", Package name (`com.ecals.app`), SHA-1 certificate fingerprint
   - **Web** : Type "Web application" (si vous supportez le web)

### 2. Récupérer les Client IDs

Copiez les Client IDs générés pour chaque plateforme.

### 3. Configurer les variables d'environnement

Ajoutez ces variables dans EAS (ou `.env` pour le développement local) :

```bash
# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=votre-client-id-ios.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=votre-client-id-android.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=votre-client-id-web.apps.googleusercontent.com

# Apple (optionnel, pour expo-apple-authentication)
EXPO_APPLE_TEAM_ID=votre-apple-team-id
```

Pour ajouter dans EAS :
```bash
eas env:create --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "votre-client-id" --visibility sensitive --environment production
eas env:create --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "votre-client-id" --visibility sensitive --environment production
eas env:create --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "votre-client-id" --visibility sensitive --environment production
```

## 🍎 Configuration Apple Sign-In

### 1. Prérequis Apple

- Compte développeur Apple actif
- App configurée dans App Store Connect
- Certificat de développement configuré

### 2. Configurer dans Xcode

1. Ouvrez votre projet dans Xcode
2. Sélectionnez votre target
3. Allez dans **Signing & Capabilities**
4. Cliquez sur **+ Capability**
5. Ajoutez **Sign in with Apple**

### 3. Configurer dans Firebase

1. Dans Firebase Console → **Authentication** → **Sign-in method** → **Apple**
2. Configurez le **Service ID** et la **Key ID** depuis votre compte développeur Apple
3. Téléchargez la clé privée (.p8) et configurez-la dans Firebase

### 4. Configurer app.config.ts

Le plugin `expo-apple-authentication` a déjà été ajouté dans `app.config.ts`. Assurez-vous que `EXPO_APPLE_TEAM_ID` est configuré si nécessaire.

## 📱 Test

### Google Sign-In

1. Lancez l'app sur un appareil iOS ou Android
2. Cliquez sur "Continuer avec Google"
3. Sélectionnez un compte Google
4. L'authentification devrait fonctionner

### Apple Sign-In

1. Lancez l'app sur un appareil iOS (uniquement)
2. Cliquez sur "Continuer avec Apple"
3. Utilisez Face ID, Touch ID ou votre code Apple ID
4. L'authentification devrait fonctionner

## ⚠️ Notes importantes

- **Google Sign-In** : Nécessite les Client IDs configurés pour chaque plateforme
- **Apple Sign-In** : Disponible uniquement sur iOS (pas sur Android ni web)
- Les utilisateurs OAuth sont automatiquement créés dans Firebase Auth
- Le profil utilisateur est créé automatiquement après la première connexion OAuth
- Pour le web, Google Sign-In nécessite une implémentation supplémentaire avec `signInWithPopup`

## 🐛 Dépannage

### Erreur "Google Client ID non configuré"
- Vérifiez que les variables d'environnement sont bien définies
- Vérifiez que les Client IDs sont corrects dans Google Cloud Console

### Erreur "Apple Sign-In n'est pas disponible"
- Vérifiez que vous êtes sur iOS
- Vérifiez que Sign in with Apple est activé dans Xcode
- Vérifiez que vous êtes connecté avec un compte Apple ID sur l'appareil

### Erreur Firebase "Invalid credential"
- Vérifiez que Google/Apple Sign-In est activé dans Firebase Console
- Vérifiez que les Client IDs correspondent bien à votre projet Firebase

