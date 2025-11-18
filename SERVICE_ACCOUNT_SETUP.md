# Guide pour créer le Service Account Key Android

## 📋 Prérequis

- Compte Google Play Console (25$ une fois)
- Accès à Google Cloud Console
- Projet Firebase/Google Cloud configuré

## 🔑 Étapes pour créer le Service Account Key

### 1. Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet `nutriai-20c35` (ou le projet lié à Firebase)

### 2. Créer un Service Account

1. Dans le menu de gauche, allez dans **IAM & Admin** → **Service Accounts**
2. Cliquez sur **+ CREATE SERVICE ACCOUNT** (Créer un compte de service)
3. Remplissez les informations :
   - **Service account name** : `eas-submit-android` (ou un nom de votre choix)
   - **Service account ID** : sera généré automatiquement
   - **Description** : `Service account pour soumettre l'app Android via EAS`
4. Cliquez sur **CREATE AND CONTINUE**

### 3. Attribuer les permissions

1. Dans **Grant this service account access to project** :
   - Rôle : **Service Account User** (ou laissez vide pour l'instant)
2. Cliquez sur **CONTINUE**
3. Cliquez sur **DONE** (Terminé)

### 4. Créer une clé JSON

1. Dans la liste des Service Accounts, cliquez sur celui que vous venez de créer
2. Allez dans l'onglet **KEYS**
3. Cliquez sur **ADD KEY** → **Create new key**
4. Sélectionnez **JSON**
5. Cliquez sur **CREATE**
6. Le fichier JSON sera téléchargé automatiquement

### 5. Configurer dans Google Play Console

1. Allez sur [Google Play Console](https://play.google.com/console/)
2. Allez dans **Setup** → **API access** (ou **Configuration** → **Accès à l'API**)
3. Dans la section **Service accounts**, cliquez sur **Link service account**
4. Entrez l'email du service account (format : `nom-du-service@projet-id.iam.gserviceaccount.com`)
5. Cliquez sur **Link**
6. Accordez les permissions nécessaires :
   - ✅ **View app information and download bulk reports**
   - ✅ **Manage production releases**
   - ✅ **Manage testing track releases**
   - ✅ **Manage testing track releases (internal, alpha, beta)**
   - ✅ **Manage testing track releases (internal, alpha, beta, production)**

### 6. Placer le fichier dans le projet

1. Renommez le fichier téléchargé en `service-account-key.json`
2. Placez-le à la racine du projet : `/Users/nassirelabbassi/ecals/service-account-key.json`
3. **IMPORTANT** : Ce fichier est déjà dans `.gitignore`, ne le commitez JAMAIS !

### 7. Vérifier la configuration

Le fichier `eas.json` devrait déjà être configuré avec :
```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./service-account-key.json",
      "track": "internal"
    }
  }
}
```

## ✅ Vérification

Pour vérifier que tout fonctionne :

```bash
# Vérifier que le fichier existe
ls -la service-account-key.json

# Tester la soumission (cela vérifiera la connexion)
eas submit --platform android --profile production --dry-run
```

## 🔒 Sécurité

- ⚠️ **NE JAMAIS** commiter le fichier `service-account-key.json`
- ⚠️ **NE JAMAIS** partager ce fichier publiquement
- ✅ Le fichier est déjà dans `.gitignore`
- ✅ Si le fichier est compromis, supprimez-le et créez-en un nouveau

## 🚀 Prochaines étapes

Une fois le service account key créé et placé :

1. Vérifiez que le fichier est bien à la racine du projet
2. Testez la soumission avec `eas submit --platform android --profile production`
3. Si tout fonctionne, vous pouvez build et soumettre votre app !

